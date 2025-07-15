const axios = require("axios")

const getPlayerBuild = async (characterName, uid) => {
  try {
    console.log(`[TOOL_CALL] Buscando dados do UID ${uid} para o personagem ${characterName}`)

    const playerResponse = await axios.get(`https://enka.network/api/uid/${uid}`, {
      headers: { "User-Agent": "Denkitsu/1.0" }
    })

    const characters = playerResponse.data?.avatarInfoList || []
    const formattedCharName = characterName.toLowerCase().replace(/[- ]/g, "")

    if (characters.length === 0) {
      return { status: 404, data: { message: `Nenhum personagem encontrado no showcase do UID ${uid}. Verifique se a opção está ativa no jogo.` } }
    }

    return { status: 200, data: playerResponse.data }

  } catch (error) {
    if (error.response?.status === 404) {
      return { status: 404, data: { message: `UID ${uid} não encontrado ou perfil privado.` } }
    }
    console.error(`[GET_PLAYER_BUILD_TOOL] Erro:`, error.message)
    return { status: 500, data: { message: "Ocorreu um erro ao se comunicar com o serviço do Enka.network." } }
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
