const axios = require("axios")
const createAppError = require("../../errors")

const executeHttpRequest = async ({ config }) => {
  try {
    console.log("httpConfig", config)
    const response = await axios({
      url: config.url,
      method: config.method || "GET",
      headers: config.headers || {},
      data: config.body || undefined,
      params: config.params || undefined
    })
    return { data: response.data }
  } catch (error) {
    console.error(`[HTTP_SERVICE] Erro ao consumir API "${config?.url}":`, error.message)
    const status = error.response?.status
    const details = error.response?.data ? `Detalhes: ${JSON.stringify(error.response.data)}` : "O servidor pode estar indisponível ou a URL está incorreta."
    throw createAppError(`A requisição HTTP para "${config.url}" falhou${status ? ` com status ${status}` : ""}. ${details}`, status || 503, "HTTP_REQUEST_FAILED")
  }
}

const httpTool = {
  type: "function",
  function: {
    name: "httpTool",
    description: "Use essa tool para executar requisições HTTP pré-configuradas e retorna respostas brutas",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Endpoint completo da API"
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE"]
        },
        headers: {
          type: "object",
          description: "Cabeçalhos HTTP"
        },
        body: {
          type: "object",
          description: "Payload da requisição"
        },
        params: {
          type: "object",
          description: "Parâmetros de query string"
        }
      },
      required: ["url", "method"]
    }
  }
}

module.exports = { executeHttpRequest, httpTool }
