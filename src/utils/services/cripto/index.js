const axios = require("axios")

const MB_API_V4_URL = "https://api.mercadobitcoin.net/api/v4"

const getCoinQuote = async (symbols) => {
  try {
    console.log(`[TOOL_CALL] Buscando tickers para os símbolos: ${symbols}`)
    const formattedSymbols = symbols.toUpperCase().trim()
    const { data } = await axios.get(`${MB_API_V4_URL}/tickers`, {
      params: { symbols: formattedSymbols }
    })
    const formatBRL = (value) => {
      return parseFloat(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }
    const tickers = data.map((ticker) => ({
      buy: formatBRL(ticker.buy),
      date: new Date(Number(ticker.date) * 1000).toLocaleString("pt-BR"),
      high: formatBRL(ticker.high),
      last: formatBRL(ticker.last),
      low: formatBRL(ticker.low),
      open: formatBRL(ticker.open),
      pair: ticker.pair,
      sell: formatBRL(ticker.sell),
      volume: `${parseFloat(ticker.vol).toFixed(4)} ${cryptoSymbol}`,
    }))
    return { status: 200, data: tickers }
  } catch (error) {
    console.error(`[CRIPTO_SERVICE] Erro ao buscar os tickers "${symbols}":`, error.message)
    if (error.response?.status === 400) {
      return { status: 400, data: { error: `Um ou mais pares de negociação são inválidos: '${symbols}'.` } }
    }
    return { status: 500, data: { error: "Não foi possível acessar a API do Mercado Bitcoin no momento." } }
  }
}

const criptoTool = {
  type: "function",
  function: {
    name: "getCoinQuote",
    description: "Busca a cotação (ticker) de um ou mais pares de criptomoedas simultaneamente na exchange Mercado Bitcoin. As cotações são em Reais (BRL).",
    parameters: {
      type: "object",
      properties: {
        symbols: {
          type: "string",
          description: "Uma string com os pares de negociação separados por vírgula, no formato 'MOEDA-CRIPTO'. Exemplo: 'BTC-BRL,ETH-BRL,SOL-BRL'."
        }
      },
      required: ["symbols"]
    }
  }
}

module.exports = { getCoinQuote, criptoTool }
