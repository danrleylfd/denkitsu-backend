const axios = require("axios")

const getGoldPrice = async () => {
  try {
    console.log("[TOOL_CALL] Buscando preço do Ouro no Albion Online")
    const { data } = await axios.get("https://www.albion-online-data.com/api/v2/stats/gold?count=24")
    if (!data || data.length === 0) {
      return {
        status: 404,
        data: { message: "Não foi possível obter os dados do preço do ouro no momento." }
      }
    }
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
    console.error("[ALBION_SERVICE] Erro ao buscar preço do Ouro:", error.message)
    throw new Error("TOOL_ERROR")
  }
}

const albionTool = {
  type: "function",
  function: {
    name: "albionTool",
    description: "Use esta ferramenta para obter o preço atual e o histórico recente do Ouro (Gold) no jogo Albion Online. A ferramenta retorna o valor mais recente em prata por unidade de ouro e os preços das últimas 24 horas.",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
}

module.exports = { getGoldPrice, albionTool }
