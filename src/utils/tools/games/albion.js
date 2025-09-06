const axios = require("axios")
const createAppError = require("../../errors")

const getGoldPrice = async () => {
  try {
    console.log("[TOOL_CALL] Buscando preço do Ouro no Albion Online")
    const { data } = await axios.get("https://www.albion-online-data.com/api/v2/stats/gold?count=24")
    if (!data || data.length === 0) throw createAppError("Não foi possível obter os dados do preço do ouro no momento. A API pode estar indisponível.", 404, "ALBION_NO_DATA")
    const latestPrice = data[0]
    const history = data.map(item => ({
      price: item.price.toLocaleString("pt-BR"),
      timestamp: new Date(item.timestamp).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit"
      })
    }))
    const formattedData = {
      latestPrice: {
        price: latestPrice.price.toLocaleString("pt-BR"),
        timestamp: new Date(latestPrice.timestamp).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          dateStyle: "short",
          timeStyle: "medium"
        })
      },
      last24h: history
    }
    return { status: 200, data: formattedData }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[ALBION_SERVICE] Erro ao buscar preço do Ouro:", error.message)
    throw createAppError("Falha ao conectar com o serviço de dados do Albion Online.", 503, "ALBION_API_ERROR")
  }
}

const toolPrompt = `Goal: Use esta ferramenta para obter o preço atual e o histórico das últimas 24 horas do Ouro (Gold) no jogo Albion Online Context Dump: Dados fornecidos pela tool`

const albionTool = {
  type: "function",
  function: {
    name: "albionTool",
    description: toolPrompt,
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { getGoldPrice, albionTool }
