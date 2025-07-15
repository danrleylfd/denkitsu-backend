const axios = require("axios")

const AMBR_API_BASE_URL = "https://gi.yatta.moe/api/v2/pt"

const getPlayerBuild = async (characterName, uid) => {
  try {
    console.log(`[TOOL_CALL] Iniciando análise para ${characterName} (UID: ${uid})`)
    console.log("[TOOL_HELPER] Buscando mapa de IDs de personagens...")
    const listResponse = await axios.get(`${AMBR_API_BASE_URL}/avatar`)
    const characterItems = listResponse.data?.data?.items
    if (!characterItems) {
      throw new Error("Estrutura da lista de avatares da API Ambr mudou.")
    }
    const characterEntry = Object.entries(characterItems).find(
      ([id, char]) => char.name.toLowerCase() === characterName.toLowerCase()
    )
    if (!characterEntry) {
      return { status: 404, data: { message: `Não foi possível encontrar o personagem '${characterName}'. Verifique se o nome está correto e completo.` } }
    }
    const characterId = characterEntry[0]
    console.log(`[TOOL_HELPER] ID de ${characterName} encontrado: ${characterId}`)
    console.log(`[TOOL_HELPER] Buscando dados de referência para o ID ${characterId}...`)
    const referenceBuildPromise = axios.get(`${AMBR_API_BASE_URL}/avatar/${characterId}`)
    console.log(`[TOOL_HELPER] Buscando dados do jogador no Enka.network para o UID ${uid}...`)
    const playerBuildPromise = axios.get(`https://enka.network/api/uid/${uid}`, {
      headers: { "User-Agent": "Denkitsu/1.0" }
    })
    const [referenceResponse, playerResponse] = await Promise.all([referenceBuildPromise, playerBuildPromise])
    if (!playerResponse.data.avatarInfoList) {
      return { status: 403, data: { message: `Não foi possível acessar os dados do UID ${uid}. O perfil pode ser privado ou não ter personagens na Vitrine.` } }
    }
    const playerData = playerResponse.data.avatarInfoList.find((char) => char.avatarId.toString() === characterId)
    if (!playerData) {
      return { status: 404, data: { message: `Personagem '${characterName}' não encontrado na Vitrine de Personagens do UID ${uid}.` } }
    }
    const responseData = {
      // referenceData: referenceResponse.data.data,
      playerData: playerData
    }
    console.log(`[TOOL_CALL] Análise concluída. Retornando dados combinados.`)
    return { status: 200, data: responseData }
  } catch (error) {
    console.error("[ANALYZE_TOOL] Erro durante a execução:", error.message)
    if (error.response) {
      return { status: error.response.status, data: { message: `Falha ao se comunicar com um dos serviços de Genshin Impact. Status: ${error.response.status}` } }
    }
    return { status: 500, data: { message: "Ocorreu um erro interno ao processar sua solicitação." } }
  }
}

const genshinTool = {
  type: "function",
  function: {
    name: "getPlayerBuild",
    description: "Busca os dados atuais (arma, artefatos, status, etc.) dos personagens que um jogador de Genshin Impact exibe em seu perfil no jogo, usando o UID fornecido.",
    parameters: {
      type: "object",
      properties: {
        characterName: {
          type: "string",
          description: "O nome do personagem de interesse para focar a resposta. Exemplo: 'Nahida'."
        },
        uid: {
          type: "string",
          description: "O UID (Identificador de Usuário) da conta do jogador no Genshin Impact. Exemplo: '123456789'."
        }
      },
      required: ["characterName", "uid"]
    }
  }
}

module.exports = { getPlayerBuild, genshinTool }
