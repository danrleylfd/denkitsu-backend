const axios = require("axios")
const createAppError = require("../../errors")

const AMBR_API_BASE_URL = "https://gi.yatta.moe/api/v2/pt"

const filterPlayerData = (playerData) => {
  if (!playerData) return null
  const propMap = {
    "1": "HP Base",
    "4": "ATQ Base",
    "7": "DEF Base",
    "2000": "HP Total",
    "2001": "ATQ Total",
    "2002": "DEF Total",
    "20": "Taxa CRIT",
    "22": "Dano CRIT",
    "23": "Recarga de Energia",
    "28": "Proficiência Elemental",
    "30": "Bônus Dano Físico",
    "40": "Bônus Dano Pyro",
    "41": "Bônus Dano Electro",
    "42": "Bônus Dano Hydro",
    "43": "Bônus Dano Dendro",
    "44": "Bônus Dano Anemo",
    "45": "Bônus Dano Geo",
    "46": "Bônus Dano Cryo",
    "FIGHT_PROP_HP": "HP Plano",
    "FIGHT_PROP_ATTACK": "ATQ Plano",
    "FIGHT_PROP_DEFENSE": "DEF Plano",
    "FIGHT_PROP_HP_PERCENT": "HP%",
    "FIGHT_PROP_ATTACK_PERCENT": "ATQ%",
    "FIGHT_PROP_DEFENSE_PERCENT": "DEF%",
    "FIGHT_PROP_CRITICAL": "Taxa CRIT%",
    "FIGHT_PROP_CRITICAL_HURT": "Dano CRIT%",
    "FIGHT_PROP_CHARGE_EFFICIENCY": "Recarga de Energia%",
    "FIGHT_PROP_ELEMENT_MASTERY": "Proficiência Elemental",
    "FIGHT_PROP_HEAL_ADD": "Bônus de Cura%",
    "FIGHT_PROP_PHYSICAL_ADD_HURT": "Bônus Dano Físico%",
    "FIGHT_PROP_FIRE_ADD_HURT": "Bônus Dano Pyro%",
    "FIGHT_PROP_ELEC_ADD_HURT": "Bônus Dano Electro%",
    "FIGHT_PROP_WATER_ADD_HURT": "Bônus Dano Hydro%",
    "FIGHT_PROP_GRASS_ADD_HURT": "Bônus Dano Dendro%",
    "FIGHT_PROP_WIND_ADD_HURT": "Bônus Dano Anemo%",
    "FIGHT_PROP_ROCK_ADD_HURT": "Bônus Dano Geo%",
    "FIGHT_PROP_ICE_ADD_HURT": "Bônus Dano Cryo%"
  }
  const artifacts = playerData.equipList.filter((item) => item.reliquary)
  const weapon = playerData.equipList.find((item) => item.weapon)
  const finalStats = {
    "HP Total": Math.round(playerData.fightPropMap["2000"]),
    "ATQ Total": Math.round(playerData.fightPropMap["2001"]),
    "DEF Total": Math.round(playerData.fightPropMap["2002"]),
    "Proficiência Elemental": Math.round(playerData.fightPropMap["28"]),
    "Taxa CRIT%": (playerData.fightPropMap["20"] * 100).toFixed(1),
    "Dano CRIT%": (playerData.fightPropMap["22"] * 100).toFixed(1),
    "Recarga de Energia%": (playerData.fightPropMap["23"] * 100).toFixed(1),
    "Bônus Dano Físico%": (playerData.fightPropMap["30"] * 100).toFixed(1),
    "Bônus Dano Pyro%": (playerData.fightPropMap["40"] * 100).toFixed(1),
    "Bônus Dano Electro%": (playerData.fightPropMap["41"] * 100).toFixed(1),
    "Bônus Dano Hydro%": (playerData.fightPropMap["42"] * 100).toFixed(1),
    "Bônus Dano Dendro%": (playerData.fightPropMap["43"] * 100).toFixed(1),
    "Bônus Dano Anemo%": (playerData.fightPropMap["44"] * 100).toFixed(1),
    "Bônus Dano Geo%": (playerData.fightPropMap["45"] * 100).toFixed(1),
    "Bônus Dano Cryo%": (playerData.fightPropMap["46"] * 100).toFixed(1),
  }
  const result = {
    level: parseInt(playerData.propMap["4001"].ival),
    friendship: playerData.fetterInfo.expLevel,
    constellations: (playerData.talentIdList || []).length,
    stats: finalStats,
    talents: playerData.skillLevelMap,
    equipment: {
      weapon: {
        id: weapon.itemId,
        level: weapon.weapon.level,
        rank: weapon.flat.rankLevel,
        refinement: weapon.weapon.affixMap ? Object.values(weapon.weapon.affixMap)[0] + 1 : 1,
      },
      artifacts: artifacts.map((art) => ({
        id: art.itemId,
        level: art.reliquary.level,
        rank: art.flat.rankLevel,
        slot: art.flat.equipType,
        mainStat: {
          stat: propMap[art.flat.reliquaryMainstat.mainPropId] || art.flat.reliquaryMainstat.mainPropId,
          value: art.flat.reliquaryMainstat.statValue
        },
        subStats: (art.flat.reliquarySubstats || []).map((sub) => ({
          stat: propMap[sub.appendPropId] || sub.appendPropId,
          value: sub.statValue
        }))
      }))
    }
  }
  return result
}

const analyzeCharacter = async ({ characterName, uid }) => {
  try {
    console.log(`[TOOL_CALL] Iniciando análise de build para ${characterName} (UID: ${uid})`)
    const listResponse = await axios.get(`${AMBR_API_BASE_URL}/avatar`)
    const characterItems = listResponse.data?.data?.items
    if (!characterItems) throw createAppError("A estrutura de dados da API de referência (Ambr) mudou. A ferramenta precisa de manutenção.", 500, "GENSHIN_API_STRUCTURE_CHANGED")
    const characterEntry = Object.entries(characterItems).find(
      ([id, char]) => char.name.toLowerCase() === characterName.toLowerCase()
    )
    if (!characterEntry) throw createAppError(`Não foi possível encontrar o personagem '${characterName}'. Verifique se o nome está correto e completo.`, 404, "GENSHIN_CHARACTER_NOT_FOUND")
    const characterId = characterEntry[0]
    const playerResponse = await axios.get(`https://enka.network/api/uid/${uid}`, {
      headers: { "User-Agent": "Denkitsu/1.0" }
    })
    if (!playerResponse.data.avatarInfoList) throw createAppError(`Não foi possível acessar os dados do UID ${uid}. O perfil pode ser privado ou não ter personagens na Vitrine.`, 403, "GENSHIN_PROFILE_PRIVATE_OR_EMPTY")
    const playerData = playerResponse.data.avatarInfoList.find((char) => char.avatarId.toString() === characterId)
    if (!playerData) throw createAppError(`Personagem '${characterName}' não encontrado na Vitrine de Personagens do UID ${uid}.`, 404, "GENSHIN_CHARACTER_NOT_IN_SHOWCASE")
    const responseData = {
      characterPlayerBuild: filterPlayerData(playerData)
    }
    console.log(`[TOOL_CALL] Análise de build concluída. Retornando dados.`)
    return { status: 200, data: responseData }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[GENSHIN_SERVICE] Erro durante a execução:", error.message)
    throw createAppError("Ocorreu um erro ao conectar com os serviços de dados do Genshin Impact.", 503, "GENSHIN_API_ERROR")
  }
}

const genshinCharAnalysisTool = {
  type: "function",
  function: {
    name: "genshinCharAnalysisTool",
    description: "Use esta ferramenta para buscar a build específica de um jogador para um determinado personagem, incluindo arma, artefatos, status, constelações e níveis de talento. Requer o nome do personagem e o UID do jogador.",
    parameters: {
      type: "object",
      properties: {
        uid: {
          type: "string",
          description: "O UID (Identificador de Usuário) da conta do jogador no Genshin Impact. Exemplo: '123456789'."
        },
        characterName: {
          type: "string",
          description: "O nome do personagem de interesse para focar a análise da build. Exemplo: 'Nahida'."
        }
      },
      required: ["uid", "characterName"]
    }
  }
}

module.exports = { analyzeCharacter, genshinCharAnalysisTool }
