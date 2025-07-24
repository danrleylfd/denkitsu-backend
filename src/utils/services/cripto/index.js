const axios = require("axios")

const MB_API_V4_URL = "https://api.mercadobitcoin.net/api/v4"

const getCoinQuote = async (product) => {
  try {
    console.log(`[TOOL_CALL] Buscando ticker para o par: ${product}`)
    const formattedProduct = product.toUpperCase().trim()

    const { data } = await axios.get(`${MB_API_V4_URL}/${formattedProduct}/ticker`)

    const formatBRL = (value) => {
      return parseFloat(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    const cryptoSymbol = formattedProduct.split("-")[1]

    const result = {
      status: 200,
      data: {
        pair: data.pair,
        last: formatBRL(data.last),
        buy: formatBRL(data.buy),
        sell: formatBRL(data.sell),
        high: formatBRL(data.high),
        low: formatBRL(data.low),
        volume: `${parseFloat(data.vol).toFixed(4)} ${cryptoSymbol}`,
        date: new Date(Number(data.date) * 1000).toLocaleString("pt-BR")
      }
    }
    return result
  } catch (error) {
    console.error(`[MERCADOBITCOIN_SERVICE] Erro ao buscar o par "${product}":`, error.message)
    if (error.response?.status === 404) {
      return { status: 404, data: { error: `O par de negociação '${product}' não foi encontrado no Mercado Bitcoin.` } }
    }
    return { status: 500, data: { error: "Não foi possível acessar a API do Mercado Bitcoin no momento." } }
  }
}

const criptoTool = {
  type: "function",
  function: {
    name: "getCoinQuote",
    description: "Busca a cotação (ticker) em tempo real de um par de criptomoedas na exchange Mercado Bitcoin. As cotações são em Reais (BRL).",
    parameters: {
      type: "object",
      properties: {
        product: {
          type: "string",
          description: "O par de negociação no formato 'CRIPTO-MOEDA', por exemplo, 'BTC-BRL' para Bitcoin, 'ETH-BRL' para Ethereum. Sempre use BRL como a segunda parte se o usuário não especificar."
        }
      },
      required: ["product"]
    }
  }
}

module.exports = { getCoinQuote, criptoTool }
