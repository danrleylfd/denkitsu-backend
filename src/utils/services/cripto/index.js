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
      pair: ticker.pair,
      open: formatBRL(ticker.open),
      buy: formatBRL(ticker.buy),
      sell: formatBRL(ticker.sell),
      low: formatBRL(ticker.low),
      high: formatBRL(ticker.high),
      last: formatBRL(ticker.last),
      volume: `${parseFloat(ticker.vol).toFixed(8)} ${ticker.pair.split("-")[0]}`,
      date: new Date(Number(ticker.date) * 1000).toLocaleString("pt-BR"),
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
    description: "Busca a cotação (ticker) de um ou mais pares de criptomoedas simultaneamente na exchange Mercado Bitcoin. As cotações são em Reais (BRL). O Denkitsu deve retornar uma tabela ao usuário sem metaconteúdo, as colulas são as props { pair, open, buy, sell, low, high, last, volume, date }. Caso haja um histórico de cotações nas mensagens anteriores, o Denkitsu deve adicionar as cotações do histórico antes da linha atual.",
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
