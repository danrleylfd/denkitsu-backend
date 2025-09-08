const prompts = require("../../../utils/prompts")
const Agent = require("../../models/agent")
const Tool = require("../../models/tool")
const Acquisition = require("../../models/acquisition")
const { AGENTS_DEFINITIONS } = require("../../../utils/constants/definitions")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const createAppError = require("../../../utils/errors")

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

  const userAcquisitions = await Acquisition.find({ user: userId, itemType: "Agent" }).select("item").lean()
  const acquiredAgentIds = userAcquisitions.map(acq => acq.item)
  const customAgents = await Agent.find({
    $or: [
      { author: userId },
      { _id: { $in: acquiredAgentIds } }
    ]
  }).select("name description").lean()
  const allAgents = [
    ...AGENTS_DEFINITIONS.map(a => ({ name: a.name, description: a.description })),
    ...customAgents
  ]
  const uniqueAgents = allAgents.reduce((acc, current) => {
    if (!acc.find(item => item.name === current.name)) {
      acc.push(current)
    }
    return acc
  }, [])
  const agentListContext = "Agentes Disponíveis:\n" + uniqueAgents.map(a => `     - ${a.name}: ${a.description}`).join("\n")
  const dynamicRouterPrompt = JSON.parse(JSON.stringify(routerPromptTemplate))
  dynamicRouterPrompt.content = dynamicRouterPrompt.content.replace("{{AGENT_LIST}}", agentListContext)
  return dynamicRouterPrompt
}

const getSystemPrompt = async (mode, userID) => {
  if (mode === "Roteador") return getRouterPrompt(userID)
  let systemPrompt = prompts.find(p => p.role === "system" && p.content.trim().startsWith(`Agente ${mode}`))
  if (systemPrompt) return systemPrompt

  const userAcquisitions = await Acquisition.find({ user: userID, itemType: "Agent" }).select("item").lean()
  const acquiredAgentIds = userAcquisitions.map(acq => acq.item)

  const customAgent = await Agent.findOne({
    name: mode,
    $or: [
      { author: userID },
      { _id: { $in: acquiredAgentIds } }
    ]
  })

  if (customAgent?.prompt) {
    const { goal, returnFormat, warning, contextDump } = customAgent.prompt
    return { role: "system", content: `Agente ${customAgent.name}\nGoal\n${goal}\nReturn Format\n${returnFormat}\nWarning\n${warning}\nContext Dump\n${contextDump}` }
  }
  return prompts[0]
}

const buildToolOptions = async (aiProvider, use_tools = [], userId, mode) => {
  let finalUseTools = [...use_tools]
  if (mode === "Suporte") {
    finalUseTools = ["cancelSubscriptionTool", "refundSubscriptionTool", "reactivateSubscriptionTool", "syncSubscriptionTool"]
  }
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

    const userAcquisitions = await Acquisition.find({ user: userId, itemType: "Tool" }).select("item").lean()
    const acquiredToolIds = userAcquisitions.map(acq => acq.item)

    const customToolNames = finalUseTools.filter(name => !builtInTools.some(bt => bt.function.name === name))

    if (customToolNames.length > 0) {
      const userCustomTools = await Tool.find({
        name: { $in: customToolNames },
        $or: [
          { author: userId },
          { _id: { $in: acquiredToolIds } }
        ]
      })

      const customToolSchemas = userCustomTools.map(tool => ({
        type: "function",
        function: { name: tool.name, description: tool.description, parameters: tool.parameters }
      }))

      const combinedTools = [...(toolOptions.tools || []), ...filteredBuiltInTools, ...customToolSchemas]
      if (combinedTools.length > 0) {
        toolOptions.tools = combinedTools
        toolOptions.tool_choice = "auto"
      }
    } else {
      if (filteredBuiltInTools.length > 0) {
        toolOptions.tools = [...(toolOptions.tools || []), ...filteredBuiltInTools]
        toolOptions.tool_choice = "auto"
      }
    }
  }
  return toolOptions
}

const resolveObjectPath = (obj, path) => {
  if (!path || path === "data") return obj
  return path.split(".").reduce((prev, curr) => {
    const arrMatch = curr.match(/(\w+)\[(\d+)\]/)
    if (arrMatch) {
      const key = arrMatch[1]
      const index = parseInt(arrMatch[2], 10)
      return prev && prev[key] ? prev[key][index] : undefined
    }
    return prev ? prev[curr] : undefined
  }, obj)
}

const executeToolCall = async (toolCall, allUserCustomTools, user) => {
  const functionName = toolCall.function.name
  let functionArgs
  try {
    functionArgs = JSON.parse(toolCall.function.arguments)
  } catch (e) {
    console.error(`[TOOL_ARG_PARSE_ERROR] Ferramenta: ${functionName}. Args:`, toolCall.function.arguments)
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: JSON.stringify({ error: `Argumentos inválidos fornecidos em formato JSON não-processável. Raw: ${toolCall.function.arguments}` })
    }
  }
  try {
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
      console.log("httpConfig", httpConfig)
      const functionResponse = await availableTools.httpTool(httpConfig)
      const mappedResponse = resolveObjectPath(functionResponse.data, customTool.responseMapping || "data")
      functionResponseContent = JSON.stringify(mappedResponse)
    } else if (availableTools[functionName]) {
      console.log(`[TOOL CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
      const functionToCall = availableTools[functionName]
      if (["cancelSubscriptionTool", "refundSubscriptionTool", "reactivateSubscriptionTool", "syncSubscriptionTool"].includes(functionName)) {
        if (!user || !user.email) throw new Error("Usuário autenticado ou e-mail não encontrado para a execução da ferramenta de suporte.")
        const functionResponse = await functionToCall(user)
        functionResponseContent = JSON.stringify(functionResponse.data)
      } else {
        const functionResponse = await functionToCall(functionArgs)
        functionResponseContent = JSON.stringify(functionResponse.data)
      }
    } else {
      console.warn(`[TOOL WARNING] Function ${functionName} not found.`)
      throw createAppError(`A ferramenta "${functionName}" não foi encontrada ou não está ativa.`, 404, "TOOL_NOT_FOUND")
    }
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: functionResponseContent
    }
  } catch (error) {
    console.error(`[TOOL_EXECUTION_ERROR] Ferramenta: ${functionName}. Erro:`, error.message)
    const errorMessage = error.isOperational ? error.message : `A ferramenta '${functionName}' falhou com um erro inesperado.`
    const errorCode = error.isOperational ? error.errorCode : "TOOL_UNHANDLED_ERROR"
    return {
      tool_call_id: toolCall.id,
      role: "tool",
      name: functionName,
      content: JSON.stringify({ error: { code: errorCode, message: errorMessage } })
    }
  }
}

const processToolCalls = async (toolCalls, user) => {
  const userAcquisitions = await Acquisition.find({ user: user._id, itemType: "Tool" }).select("item").lean()
  const acquiredToolIds = userAcquisitions.map(acq => acq.item)
  const allUserCustomTools = await Tool.find({
    $or: [
      { author: user._id },
      { _id: { $in: acquiredToolIds } }
    ]
  })

  const toolResultPromises = toolCalls.map(toolCall => executeToolCall(toolCall, allUserCustomTools, user))
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
