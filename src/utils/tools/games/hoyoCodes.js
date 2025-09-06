const axios = require("axios")
const createAppError = require("../../errors")

const getHoyoCodes = async ({ game }) => {
  try {
    console.log(`[TOOL_CALL] Buscando códigos para o jogo: ${game}`)
    const { data } = await axios.get(`https://hoyo-codes.seria.moe/codes?game=${game}`)
    if (!data || !data.codes || data.codes.length === 0) throw createAppError(`Nenhum código de resgate ativo foi encontrado para ${game} no momento.`, 404, "HOYO_CODES_NOT_FOUND")
    const redeemUrlMap = {
      genshin: "https://genshin.hoyoverse.com/en/gift",
      hkrpg: "https://hsr.hoyoverse.com/gift",
      honkai3rd: "https://honkaiimpact3.hoyoverse.com/global/en-us/fab",
      nap: "https://zenless.hoyoverse.com/en-us/gift",
      tot: "https://tot.hoyoverse.com/gift"
    }
    const baseUrl = redeemUrlMap[game] || redeemUrlMap.genshin
    const activeCodes = data.codes
      .filter((code) => code.status === "OK")
      .map((code) => ({
        code: code.code,
        rewards: code.rewards || "Recompensa não especificada",
        redeem_url: `${baseUrl}?code=${code.code}`
      }))
    return { status: 200, data: { codes: activeCodes } }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[HOYO_CODES_SERVICE] Erro ao buscar códigos:", error.message)
    throw createAppError("Falha ao conectar com o serviço de busca de códigos da Hoyoverse.", 503, "HOYO_API_ERROR")
  }
}

const hoyoCodesTool = {
  type: "function",
  function: {
    name: "hoyoCodesTool",
    description: "Busca os códigos de resgate ativos mais recentes para um jogo da Hoyoverse. Retorna uma lista de códigos, suas recompensas e um link para resgate.",
    parameters: {
      type: "object",
      properties: {
        game: {
          type: "string",
          description: "O jogo para o qual buscar os códigos. Use 'genshin' para Genshin Impact, 'hkrpg' para Honkai: Star Rail (HSR,SR), 'nap' para Zenless Zone Zero(ZZZ). 'honkai3rd' para Honkai Impact 3rd e 'tot' para Tears of Themis são depreciados e podem não funcionar. o usuário pode pedir os códigos usando apelidos case insensitive",
          enum: ["genshin", "hkrpg", "nap", "honkai3rd", "tot"]
        }
      },
      required: ["game"]
    }
  }
}

module.exports = { getHoyoCodes, hoyoCodesTool }
