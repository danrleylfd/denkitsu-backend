const prompts = require("../../../utils/prompts")
const Agent = require("../../models/agent")
const Tool = require("../../models/tool")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")

const cleanToolCallSyntax = (content) => {
  if (typeof content !== "string") return content
  return content.replace(/<\|.*?\|>/g, "").trim()
}

const extractReasoning = (rawContent = "") => {
  let reasoning = ""
  const content = rawContent.replace(/(<think>[\s\S]*?<\/think>|<thinking>[\s\S]*?<\/thinking>|◁think▷[\s\S]*?◁\/think▷)/gs, (match) => {
    reasoning += match
    return ""
  }).trim()
  return { content, reasoning }
}

async function* processStreamAndExtractReasoning(streamResponse) {
  let streamBuffer = ""
  for await (const chunk of streamResponse) {
    const delta = chunk.choices[0]?.delta
    if (!delta) continue
    if (delta.reasoning) {
      yield { choices: [{ delta: { reasoning: delta.reasoning } }] }
    }
    if (delta.content) {
      streamBuffer += delta.content
      const { content, reasoning } = extractReasoning(streamBuffer)
      if (reasoning) {
        yield { choices: [{ delta: { reasoning } }] }
        streamBuffer = content
      }
    }
  }
  if (streamBuffer) {
    yield { choices: [{ delta: { content: streamBuffer } }] }
  }
}

const getRouterPrompt = async (userId) => {
  const routerPromptTemplate = prompts.find(p => p.content.trim().startsWith("Agente Roteador"))
  if (!routerPromptTemplate) return prompts[0]
  const customAgents = await Agent.find({ user: userId }).select("name description")
  let customAgentsContext = ""
  if (customAgents && customAgents.length > 0) {
    const agentList = customAgents.map(a => `- ${a.name}: ${a.description}`).join("\n    ")
    customAgentsContext = `\n    Agentes Customizados do Usuário:\n    ${agentList}`
  }
  const dynamicRouterPrompt = JSON.parse(JSON.stringify(routerPromptTemplate))
  dynamicRouterPrompt.content += customAgentsContext
  return dynamicRouterPrompt
}

const getSystemPrompt = async (mode, userId) => {
  if (mode === "Roteador") return getRouterPrompt(userId)
  let systemPrompt = prompts.find(p => p.role === "system" && p.content.trim().startsWith(`Agente ${mode}`))
  if (systemPrompt) return systemPrompt
  const customAgent = await Agent.findOne({ user: userId, name: mode })
  if (customAgent?.prompt) {
    const { goal, returnFormat, warning, contextDump } = customAgent.prompt
    return { role: "system", content: `Agente ${customAgent.name}\nGoal\n${goal}\nReturn Format\n${returnFormat}\nWarning\n${warning}\nContext Dump\n${contextDump}` }
  }
  return prompts[0]
}

const buildToolOptions = async (aiProvider, use_tools = [], userId, mode) => {
  let finalUseTools = [...use_tools]
  if (mode === "Roteador") finalUseTools.push("selectAgentTool")
  let toolOptions = {}
  if (aiProvider === "groq") {
    if (finalUseTools.includes("web")) finalUseTools = finalUseTools.filter(t => t !== "web")
    const nativeTools = []
    if (finalUseTools.includes("browser_search")) {
      nativeTools.push({ type: "browser_search" })
      finalUseTools = finalUseTools.filter(t => t !== "browser_search")
    }
    if (finalUseTools.includes("code_interpreter")) {
      nativeTools.push({ type: "code_interpreter" })
      finalUseTools = finalUseTools.filter(t => t !== "code_interpreter")
    }
    if (nativeTools.length > 0) toolOptions.tools = nativeTools
  }
  if (Array.isArray(finalUseTools) && finalUseTools.length > 0) {
    const filteredBuiltInTools = builtInTools.filter(tool => tool && tool.function && finalUseTools.includes(tool.function.name))
    const userCustomTools = await Tool.find({ user: userId, name: { $in: finalUseTools } })
    const customToolSchemas = userCustomTools.map(tool => ({
      type: "function",
      function: { name: tool.name, description: tool.description, parameters: tool.parameters }
    }))
    const combinedTools = [...(toolOptions.tools || []), ...filteredBuiltInTools, ...customToolSchemas]
    if (combinedTools.length > 0) {
      toolOptions.tools = combinedTools
      toolOptions.tool_choice = "auto"
    }
  }
  return toolOptions
}

const executeToolCall = async (toolCall, allUserCustomTools) => {
  const functionName = toolCall.function.name
  let functionArgs
  try {
    functionArgs = JSON.parse(toolCall.function.arguments)
  } catch (e) {
    console.error(`[TOOL_ARG_PARSE_ERROR] Failed to parse arguments for tool ${functionName}. Raw args:`, toolCall.function.arguments)
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: JSON.stringify({ error: "Invalid arguments provided. Could not parse JSON.", raw_arguments: toolCall.function.arguments })
    }
  }
  let functionResponseContent
  const customTool = allUserCustomTools.find(t => t.name === functionName)
  if (customTool) {
    console.log(`[CUSTOM TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
    let { url, queryParams, headers, body } = customTool.httpConfig
    const replacePlaceholders = (template) => {
      if (!template) return template
      let processed = JSON.stringify(template)
      Object.keys(functionArgs).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, "g")
        processed = processed.replace(regex, functionArgs[key])
      })
      return JSON.parse(processed)
    }
    let finalUrl = new URL(replacePlaceholders(url))
    if (queryParams) {
      const processedQueryParams = replacePlaceholders(queryParams)
      const searchParams = new URLSearchParams(finalUrl.search)
      for (const key in processedQueryParams) {
        searchParams.set(key, processedQueryParams[key])
      }
      finalUrl.search = searchParams.toString()
    }
    const httpConfig = {
      method: customTool.httpConfig.method,
      url: finalUrl.toString(),
      headers: replacePlaceholders(headers),
      body: replacePlaceholders(body)
    }
    const functionResponse = await availableTools.httpTool(httpConfig)
    functionResponseContent = JSON.stringify(functionResponse.data)
  } else if (availableTools[functionName]) {
    console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
    const functionToCall = availableTools[functionName]
    const functionResponse = await functionToCall(...Object.values(functionArgs))
    functionResponseContent = JSON.stringify(functionResponse.data)
  } else {
    console.warn(`[TOOL WARNING] Function ${functionName} not found.`)
    functionResponseContent = JSON.stringify({ error: `A ferramenta "${functionName}" não foi encontrada ou não está ativa.` })
  }
  return {
    tool_call_id: toolCall.id,
    role: "tool",
    name: functionName,
    content: functionResponseContent
  }
}

const processToolCalls = async (toolCalls, userId) => {
  const allUserCustomTools = await Tool.find({ user: userId })
  const toolResultPromises = toolCalls.map(toolCall => executeToolCall(toolCall, allUserCustomTools))
  return Promise.all(toolResultPromises)
}

module.exports = {
  cleanToolCallSyntax,
  extractReasoning,
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  processStreamAndExtractReasoning
}
