const { ask } = require("../../../utils/api/ai")
const { availableTools, tools: builtInTools } = require("../../../utils/tools")
const prompts = require("../../../utils/prompts")
const { sanitizeMessages } = require("../../../utils/helpers/ai")
const Tool = require("../../models/tool")

const sendMessage = async (req, res) => {
  try {
    const { aiProvider = "groq", model, messages: userPrompts, aiKey, plugins, use_tools, stream = false, mode = "Padrão" } = req.body

    console.log("--- INÍCIO DA REQUISIÇÃO ---", { stream, use_tools })

    let systemPrompt = prompts.find(p => p.content.trim().startsWith(`Agente ${mode}`))
    if (!systemPrompt) systemPrompt = prompts[0]
    let messages = [systemPrompt, ...userPrompts]

    const toolsAreActive = use_tools && Array.isArray(use_tools) && use_tools.length > 0

    if (!toolsAreActive) {
      const requestOptions = { model, stream, plugins: plugins ? plugins : undefined }
      if (stream) {
        const streamResponse = await ask(aiProvider, aiKey, messages, requestOptions)
        res.setHeader("Content-Type", "text/event-stream")
        for await (const chunk of streamResponse) {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        }
        return res.end()
      } else {
        const { status, data } = await ask(aiProvider, aiKey, messages, requestOptions)
        return res.status(status).json(data)
      }
    }

    const requestOptions = { model, stream: false }
    const filteredBuiltInTools = builtInTools.filter((tool) => use_tools.includes(tool.function.name))
    const userCustomTools = await Tool.find({ user: req.userID, name: { $in: use_tools } })
    const customToolSchemas = userCustomTools.map(tool => ({
      type: "function",
      function: { name: tool.name, description: tool.description, parameters: tool.parameters }
    }))
    requestOptions.tools = [...filteredBuiltInTools, ...customToolSchemas]
    requestOptions.tool_choice = "auto"

    const { data } = await ask(aiProvider, aiKey, messages, requestOptions)
    const resMsg = data.choices[0].message

    if (!resMsg.tool_calls) {
      if (stream) {
        res.setHeader("Content-Type", "text/event-stream")
        const chunk = { choices: [{ delta: { content: resMsg.content || "" } }] }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        return res.end()
      }
      return res.status(200).json(data)
    }

    messages.push(resMsg)

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream")
      for (const toolCall of resMsg.tool_calls) {
        const statusUpdate = { choices: [{ delta: { tool_calls: [{ index: toolCall.index, function: { name: toolCall.function.name, arguments: "" } }] } }] }
        res.write(`data: ${JSON.stringify(statusUpdate)}\n\n`)
      }
    }

    const allUserCustomTools = await Tool.find({ user: req.userID })

    console.log(`--- PASSO 1: INICIANDO EXECUÇÃO DE ${resMsg.tool_calls.length} FERRAMENTAS ---`)

    const toolPromises = resMsg.tool_calls.map(async (toolCall) => {
      const functionName = toolCall.function.name
      const functionArgs = JSON.parse(toolCall.function.arguments)
      let functionResponseContent = ""

      const customTool = allUserCustomTools.find(t => t.name === functionName)
      const builtInTool = availableTools[functionName]

      if (customTool) {
        console.log(`[EXECUTANDO] Ferramenta customizada: ${functionName}`)
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
          for (const key in processedQueryParams) {
            finalUrl.searchParams.set(key, processedQueryParams[key])
          }
        }
        const httpConfig = {
          method: customTool.httpConfig.method,
          url: finalUrl.toString(),
          headers: replacePlaceholders(headers),
          body: replacePlaceholders(body)
        }
        const functionResponse = await availableTools.httpTool(httpConfig)
        functionResponseContent = JSON.stringify(functionResponse.data)
      } else if (builtInTool) {
        console.log(`[EXECUTANDO] Ferramenta nativa: ${functionName}`)
        const functionResponse = await builtInTool(...Object.values(functionArgs))
        const responseData = functionResponse.data !== undefined ? functionResponse.data : functionResponse
        functionResponseContent = JSON.stringify(responseData)
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
    })

    const toolResults = await Promise.all(toolPromises)
    console.log("--- PASSO 2: EXECUÇÃO DAS FERRAMENTAS CONCLUÍDA ---", toolResults)

    messages.push(...toolResults)

    const sanitized = sanitizeMessages(messages)
    console.log("--- PASSO 3: ENVIANDO RESULTADOS PARA A IA ---", JSON.stringify(sanitized, null, 2))

    const secondCallOptions = { model, stream }
    const finalResponse = await ask(aiProvider, aiKey, sanitized, secondCallOptions)

    console.log("--- PASSO 4: RESPOSTA FINAL DA IA RECEBIDA ---")

    if (stream) {
      for await (const finalChunk of finalResponse) {
        console.log("--- PASSO 5: ENVIANDO CHUNK FINAL PARA O FRONTEND ---", finalChunk.choices[0]?.delta)
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`)
      }
      return res.end()
    } else {
      return res.status(finalResponse.status).json(finalResponse.data)
    }

  } catch (error) {
    console.error("--- ERRO NO CONTROLLER ---", error)
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const errorMessages = {
      AUTHENTICATION_FAILED: { status: 401, message: "Chave de API inválida. Verifique suas credenciais." },
      RATE_LIMIT_EXCEEDED: { status: 429, message: "Limite de requisições excedido. Tente novamente mais tarde." },
      API_REQUEST_FAILED: { status: 502, message: "Falha na comunicação com o serviço de IA. Tente novamente." },
      TOOL_ERROR: { status: 500, message: "Falha ao executar ferramentas." },
    }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = sendMessage
