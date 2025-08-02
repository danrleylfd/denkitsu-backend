const axios = require("axios")

const executeHttpRequest = async (config) => {
  console.log(config)
  try {
    const response = await axios({
      url: config.url,
      method: config.method || "GET",
      headers: config.headers || {},
      data: config.body || undefined,
      params: config.params || undefined
    })
    return { data: response.data }
  } catch (error) {
    console.error(`[HTTP_SERVICE] Erro ao consumir API "${config}":`, error.message)
    throw error
  }
}

const httpTool = {
  type: "function",
  function: {
    name: "httpTool",
    description: "Executa requisições HTTP pré-configuradas e retorna respostas brutas",
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
