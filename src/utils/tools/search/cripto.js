const axios = require("axios")
const createAppError = require("../../errors")

const MB_API_V4_URL = "https://api.mercadobitcoin.net/api/v4"

const getCoinQuote = async ({ symbols }) => {
  try {
    console.log(`[TOOL_CALL] Buscando tickers para os símbolos: ${symbols}`)
    const formattedSymbols = symbols.toUpperCase().trim()
    const { data } = await axios.get(`${MB_API_V4_URL}/tickers`, {
      params: { symbols: formattedSymbols }
    })
    if (!data || data.length === 0) throw createAppError(`Nenhuma cotação encontrada para os símbolos fornecidos: "${symbols}". Verifique se os símbolos são válidos (ex: BTC-BRL).`, 404, "CRYPTO_SYMBOLS_NOT_FOUND")
    const formatBRL = (value) => {
      return parseFloat(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }
    const tickers = data.map((ticker) => ({
      pair: ticker.pair,
      open: formatBRL(ticker.open),
      last: formatBRL(ticker.last),
      low: formatBRL(ticker.low),
      high: formatBRL(ticker.high),
      buy: formatBRL(ticker.buy),
      sell: formatBRL(ticker.sell),
      volume: `${parseFloat(ticker.vol).toFixed(8)} ${ticker.pair.split("-")[0]}`,
      date: new Date(Number(ticker.date) * 1000).toLocaleString("pt-BR"),
    }))
    return { status: 200, data: tickers }
  } catch (error) {
    if (error.isOperational) throw error
    console.error(`[CRIPTO_SERVICE] Erro ao buscar os tickers "${symbols}":`, error.message)
    throw createAppError("Falha ao conectar com o serviço de cotação de criptomoedas (Mercado Bitcoin).", 503, "CRYPTO_API_ERROR")
  }
}

const criptoTool = {
  type: "function",
  function: {
    name: "criptoTool",
    description: "Goal: Use essa tool para buscar a cotação (ticker) de um ou mais pares de criptomoedas simultaneamente na exchange Mercado Bitcoin. As cotações são em Reais (BRL). Context Dump: Dados fornecidos pelo usuário/tool",
    parameters: {
      type: "object",
      properties: {
        symbols: {
          type: "string",
          description: "Uma string com os pares de negociação separados por vírgula, no formato 'CRIPTO-MOEDA'. Exemplo: 'BTC-BRL,ETH-BRL,SOL-BRL'. Sempre use BRL como a segunda parte se o usuário não especificar."
        }
      },
      required: ["symbols"]
    }
  }
}

module.exports = { getCoinQuote, criptoTool }
