const { ask } = require("../../../utils/api/ai")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const prompts = require("../../../utils/prompts")
const Agent = require("../../models/agent")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const Tool = require("../../models/tool")

const extractReasoning = (message) => {
  let reasoning = ""
  if (!message || !message.content) {
    return { content: "", reasoning }
  }
  const content = message.content.replace(/(<think>[\s\S]*?<\/think>)/gs, (match) => {
    reasoning = match
    return ""
  })
  return { content: content.trim(), reasoning }
}

const executeToolCalls = async (responseMessage, messages, allUserCustomTools) => {
  console.log("[TOOL_HANDLER] Ferramenta(s) chamada(s). Executando...")
  messages.push(responseMessage)
  for (const toolCall of responseMessage.tool_calls) {
    const functionName = toolCall.function.name
    const functionArgs = JSON.parse(toolCall.function.arguments)
    let functionResponseContent = ""
    const customTool = allUserCustomTools.find(t => t.name === functionName)
    if (customTool) {
      console.log(`[CUSTOM_TOOL_CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
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
      console.log(`[TOOL_CALL] Executing: ${functionName}(${JSON.stringify(functionArgs)})`)
      const functionToCall = availableTools[functionName]
      const functionResponse = await functionToCall(...Object.values(functionArgs))
      functionResponseContent = JSON.stringify(functionResponse.data)
    } else {
      console.warn(`[TOOL WARNING] Function ${functionName} not found.`)
      functionResponseContent = JSON.stringify({ error: `A ferramenta "${functionName}" não foi encontrada.` })
    }
    messages.push({ tool_call_id: toolCall.id, role: "tool", name: functionName, content: functionResponseContent })
  }
  return messages
}

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: userPrompts, aiKey, plugins, use_tools, stream = false, mode = "Padrão" } = req.body
    const allUserCustomAgents = await Agent.find({ user: req.userID })
    const allUserCustomTools = await Tool.find({ user: req.userID })
    const customToolSchemas = allUserCustomTools.map(tool => ({ type: "function", function: { name: tool.name, description: tool.description, parameters: tool.parameters } }))
    const requestOptions = { model, plugins: plugins ? plugins : undefined }
    if (use_tools && Array.isArray(use_tools) && use_tools.length > 0) {
      const filteredBuiltInTools = builtInTools.filter((tool) => use_tools.includes(tool.function.name))
      const filteredCustomTools = customToolSchemas.filter(tool => use_tools.includes(tool.function.name))
      requestOptions.tools = [...filteredBuiltInTools, ...filteredCustomTools]
      requestOptions.tool_choice = "auto"
    }
    let finalResponse
    let initialReasoning = ""
    if (mode === "Roteador") {
      const baseRouterPrompt = prompts.find(p => p.content.trim().startsWith("Agente Roteador"))
      let dynamicRouterContent = baseRouterPrompt.content
      const customAgentNames = allUserCustomAgents.map(agent => agent.name)
      if (customAgentNames.length > 0) {
        dynamicRouterContent += `\n    Agentes Especializados Customizados: ${customAgentNames.join(", ")}.`
      }
      const routerPrompt = { ...baseRouterPrompt, content: dynamicRouterContent }
      let initialMessages = [routerPrompt, ...userPrompts]
      const { data: initialResponseData } = await ask(aiProvider, aiKey, initialMessages, { ...requestOptions, stream: false })
      const responseMessage = initialResponseData.choices[0].message
      initialReasoning = extractReasoning(responseMessage).reasoning
      if (responseMessage.tool_calls && responseMessage.tool_calls[0]?.function.name === "promptTool") {
        const toolCall = responseMessage.tool_calls[0]
        const agentName = JSON.parse(toolCall.function.arguments).nomeDoAgente
        let newSystemPrompt = null
        const builtInPrompt = prompts.find(p => p.content.trim().split("\n")[0].replace(/^Agente\s/i, "").toLowerCase() === agentName.toLowerCase())
        if (builtInPrompt) {
          console.log(`[AGENT_ROUTER] Carregando agente built-in: ${agentName}`)
          newSystemPrompt = { role: "system", content: builtInPrompt.content }
        } else {
          const customAgent = allUserCustomAgents.find(agent => agent.name.toLowerCase() === agentName.toLowerCase())
          if (customAgent) {
            console.log(`[AGENT_ROUTER] Carregando agente customizado: ${agentName}`)
            const { goal, returnFormat, warning, contextDump } = customAgent.prompt
            newSystemPrompt = { role: "system", content: `Agente ${customAgent.name}\nGoal\n${goal}\nReturn Format\n${returnFormat}\nWarning\n${warning}\nContext Dump\n${contextDump}` }
          }
        }
        if (newSystemPrompt) {
          const finalMessages = [newSystemPrompt, ...userPrompts]
          finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
        } else {
          console.warn(`[AGENT_ROUTER] Agente "${agentName}" não encontrado. Usando Agente Padrão.`)
          const finalMessages = [prompts[0], ...userPrompts]
          finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
        }
      } else if (responseMessage.tool_calls) {
        const finalMessages = await executeToolCalls(responseMessage, initialMessages, allUserCustomTools)
        finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
      } else {
        const defaultAgentPrompt = prompts.find(p => p.content.trim().startsWith("Agente Padrão"))
        const finalMessages = [defaultAgentPrompt, ...userPrompts]
        finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
      }
    }
    else {
      let agentPrompt = prompts.find(p => p.content.trim().startsWith(`Agente ${mode}`))
      if (!agentPrompt) {
        const customAgent = allUserCustomAgents.find(agent => agent.name === mode)
        if (customAgent) {
          const { goal, returnFormat, warning, contextDump } = customAgent.prompt
          agentPrompt = { role: "system", content: `Agente ${customAgent.name}\nGoal\n${goal}\nReturn Format\n${returnFormat}\nWarning\n${warning}\nContext Dump\n${contextDump}` }
        } else {
          agentPrompt = prompts[0]
        }
      }
      const messages = [agentPrompt, ...userPrompts]
      const { data: manualResponseData } = await ask(aiProvider, aiKey, sanitizeMessages(messages), { ...requestOptions, stream: false })
      const responseMessage = manualResponseData.choices[0].message
      initialReasoning = extractReasoning(responseMessage).reasoning
      if (responseMessage.tool_calls) {
        const finalMessages = await executeToolCalls(responseMessage, messages, allUserCustomTools)
        finalResponse = await ask(aiProvider, aiKey, sanitizeMessages(finalMessages), { ...requestOptions, stream })
      } else {
        finalResponse = { data: manualResponseData }
      }
    }
    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      if (initialReasoning) {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning: initialReasoning + "\n" } }] })}\n\n`)
      }
      if (finalResponse[Symbol.asyncIterator]) {
        for await (const chunk of finalResponse) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
      } else {
        const { content: finalContent, reasoning: finalReasoning } = extractReasoning(finalResponse.data.choices[0].message)
        if (finalReasoning) {
          res.write(`data: ${JSON.stringify({ choices: [{ delta: { reasoning: finalReasoning } }] })}\n\n`)
        }
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: finalContent } }] })}\n\n`)
      }
      return res.end()
    } else {
      const finalData = { ...finalResponse.data }
      const { content: finalContent, reasoning: finalReasoning } = extractReasoning(finalData.choices[0].message)
      finalData.choices[0].message.content = finalContent
      finalData.reasoning = [initialReasoning, finalReasoning].filter(Boolean).join("\n")
      return res.status(200).json(finalData)
    }
  } catch (error) {
    console.error(`[SEND_MESSAGE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack, aiProvider: req.body.aiProvider, model: req.body.model })
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida." },
      RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido." },
      API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com a IA." },
      TOOL_ERROR: { status: 500, message: "Falha ao executar ferramentas." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    if (!res.headersSent) {
      return res.status(status).json({ error: { code: error.message, message } })
    } else {
      res.write(`data: ${JSON.stringify({ error: { code: error.message, message } })}\n\n`)
      res.end()
    }
  }
}

module.exports = sendMessage
