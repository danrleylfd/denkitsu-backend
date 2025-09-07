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
  const agentListContext = "Agentes Disponíveis:\n" + uniqueAgents.map(a => `    - ${a.name}: ${a.description}`).join("\n")
  const dynamicRouterPrompt = JSON.parse(JSON.stringify(routerPromptTemplate))
  dynamicRouterPrompt.content = dynamicRouterPrompt.content.replace("{{AGENT_LIST}}", agentListContext)
  return dynamicRouterPrompt
}

const getSystemPrompt = async (mode, userID) => {
  if (mode === "Roteador") return getRouterPrompt(userID)
  let systemPrompt = prompts.find(p => p.role === "system" && p.content.trim().startsWith(`Agente ${mode}`))
  if (systemPrompt) return systemPrompt
  const customAgent = await Agent.findOne({ user: userID, name: mode })
  if (customAgent?.prompt) {
    const { goal, returnFormat, warning, contextDump } = customAgent.prompt
    return { role: "system", content: `Agente ${customAgent.name}\nGoal\n${goal}\nReturn Format\n${returnFormat}\nWarning\n${warning}\nContext Dump\n${contextDump}` }
  }
  return prompts[0]
}

const buildToolOptions = async (aiProvider, use_tools = [], userId, mode) => {
  let finalUseTools = [...use_tools]
  if (mode === "Suporte") {
    console.log("[AI_HELPER] Agente de Suporte ativado. Forçando o uso de ferramentas de administração.")
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
    const userCustomTools = await Tool.find({ user: userId, name: { $in: finalUseTools } })
    const customToolSchemas = userCustomTools.map(tool => ({
      type: "function",
      function: { name: tool.name, description: tool.description, parameters: tool.parameters }
    }))
    const combinedTools = [...(toolOptions.tools || []), ...filteredBuiltInTools, ...customToolSchemas]
    if (combinedTools.length > 0) {
      if (aiProvider === "gemini") {
        toolOptions.toolConfig = { function_calling_config: { mode: "AUTO" } }
        toolOptions.tools = [{ functionDeclarations: combinedTools.map(t => t.function) }]
      } else {
        toolOptions.tools = combinedTools
        toolOptions.tool_choice = "auto"
      }
    }
  }
  return toolOptions
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
      const functionResponse = await availableTools.httpTool(httpConfig)
      functionResponseContent = JSON.stringify(functionResponse.data)
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
  const allUserCustomTools = await Tool.find({ user: user._id })
  const toolResultPromises = toolCalls.map(toolCall => executeToolCall(toolCall, allUserCustomTools, user))
  return Promise.all(toolResultPromises)
}

const transformToGemini = (messages) => {
  const geminiContents = []
  const operationalMessages = messages.filter(msg => msg.role !== "system")

  operationalMessages.forEach(msg => {
    const parts = []
    let role = msg.role === "assistant" ? "model" : "user"

    // 1. Converte conteúdo de texto (string ou array multimodal)
    if (msg.content) {
      if (typeof msg.content === "string") {
        if (msg.content.trim()) parts.push({ text: msg.content })
      } else if (Array.isArray(msg.content)) {
        msg.content.forEach(part => {
          // FIX: Adicionado check de existência para part.content antes do .trim()
          if (part.type === "text" && part.content && part.content.trim()) {
            parts.push({ text: part.content })
          }
          // Lógica para imagens (ainda não implementada, mas o stub está aqui para evitar erros)
          if (part.type === "image_url") {
            // No futuro: converter URL para base64 e adicionar como inlineData
            // Por agora, ignoramos para não quebrar.
          }
        })
      }
    }

    // 2. Converte 'tool_calls' do assistente para 'functionCall' do Gemini
    if (msg.role === "assistant" && msg.tool_calls) {
      msg.tool_calls.forEach(toolCall => {
        try {
          parts.push({
            functionCall: {
              name: toolCall.function.name,
              args: JSON.parse(toolCall.function.arguments)
            }
          })
        } catch (e) {
          console.error("Erro no parse de argumentos do tool_call para Gemini:", e)
        }
      })
    }

    // 3. Converte respostas de ferramenta ('role: tool') para 'functionResponse' do Gemini
    if (msg.role === "tool") {
      role = "user" // No Gemini, a resposta da ferramenta vem do usuário.
      try {
        parts.push({
          functionResponse: {
            name: msg.name,
            response: JSON.parse(msg.content)
          }
        })
      } catch (e) {
        console.error("Erro no parse do conteúdo da tool response para Gemini:", e)
        parts.push({
          functionResponse: {
            name: msg.name,
            response: { error: "Conteúdo da ferramenta em formato JSON inválido.", details: msg.content }
          }
        })
      }
    }

    // 4. Adiciona a mensagem transformada apenas se tiver partes válidas.
    // Isso previne o erro de 'data must have one initialized field'.
    if (parts.length > 0) {
      geminiContents.push({ role, parts })
    }
  })

  return geminiContents
}


const transformFromGemini = (geminiResponse) => {
  const candidate = geminiResponse?.candidates?.[0]
  if (!candidate) return { role: "assistant", content: "" }

  const content = candidate.content?.parts?.find(p => p.text)?.text || ""
  const tool_calls = candidate.content?.parts
    .filter(p => p.functionCall)
    .map((p, i) => ({
      id: `call_${i}`,
      type: "function",
      function: {
        name: p.functionCall.name,
        arguments: JSON.stringify(p.functionCall.args)
      }
    }))

  return {
    role: "assistant",
    content: content || null,
    tool_calls: tool_calls?.length > 0 ? tool_calls : undefined
  }
}

module.exports = {
  cleanToolCallSyntax,
  extractReasoning,
  getSystemPrompt,
  buildToolOptions,
  processToolCalls,
  processStreamAndExtractReasoning,
  transformToGemini,
  transformFromGemini
}
