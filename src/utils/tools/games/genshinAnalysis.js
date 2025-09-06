const axios = require("axios")
const createAppError = require("../../errors")

const filterReferenceData = (data) => {
  if (!data) return null
  const mapIdToName = (id) => data.items[id]?.name || `Unknown Item (ID: ${id})`
  const calculateUpgradeMaterials = () => {
    const totals = {}
    const talentMaterialIds = new Set()
    const firstTalent = Object.values(data.talent)[0]
    if (firstTalent?.promote) {
      for (const level in firstTalent.promote) {
        const costItems = firstTalent.promote[level]?.costItems
        if (costItems) {
          Object.keys(costItems).forEach(id => talentMaterialIds.add(id))
        }
      }
    }
    Object.entries(data.ascension || {}).forEach(([id, amount]) => {
      if (!talentMaterialIds.has(id)) {
        totals[id] = (totals[id] || 0) + amount
      }
    })
    return Object.entries(totals).map(([id, amount]) => ({
      name: mapIdToName(id),
      amount
    }))
  }
  const calculateTotalTalentMaterials = () => {
    const materialsTotal = {}
    const talent = Object.values(data.talent)[0]
    if (talent?.promote) {
      for (let level = 2;level <= 10; level++) {
        const costItems = talent.promote[level]?.costItems
        if (costItems) {
          Object.entries(costItems).forEach(([id, amount]) => {
            materialsTotal[id] = (materialsTotal[id] || 0) + amount
          })
        }
      }
    }
    return Object.entries(materialsTotal).map(([id, amount]) => ({
      name: mapIdToName(id),
      amount
    }))
  }
  const calculateTotalMora = () => {
    let total = 0
    Object.values(data.upgrade?.promote || []).forEach(level => {
      if (level.coinCost) total += level.coinCost
    })
    const talent = Object.values(data.talent)[0]
    if (talent?.promote) {
      for (let level = 2; level <= 10; level++) {
        const promoteData = talent.promote[level]
        if (promoteData?.coinCost) total += promoteData.coinCost
      }
    }
    return total
  }
  const result = {
    name: data.name,
    birthday: data.birthday,
    birthdayFormat: ["MM/DD"],
    rank: data.rank,
    element: data.element,
    weaponType: data.weaponType,
    nationality: data.region,
    region: data.fetter.native,
    title: data.fetter.title,
    detail: data.fetter.detail,
    constellationName: data.fetter.constellation,
    specialProp: data.specialProp,
    upgradeNeedMaterial: {
      xpBooks: 419,
      moraCoin: calculateTotalMora(),
      ascensionMaterials: calculateUpgradeMaterials(),
      talentMaterials: calculateTotalTalentMaterials(),
    },
    talents: Object.values(data.talent).map(t => ({
      name: t.name,
      description: t.description.replace(/<[^>]+>/g, ""),
    }))
  }
  return result
}

const filterPlayerData = (playerData) => {
  if (!playerData) {
    return null
  }
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

const AMBR_API_BASE_URL = "https://gi.yatta.moe/api/v2/pt"

const genshinAnalysis = async ({ characterName, uid }) => {
  try {
    console.log(`[TOOL_CALL] Iniciando análise para ${characterName} (UID: ${uid})`)
    console.log("[TOOL_HELPER] Buscando mapa de IDs de personagens...")
    const listResponse = await axios.get(`${AMBR_API_BASE_URL}/avatar`)
    const characterItems = listResponse.data?.data?.items
    if (!characterItems) {
      throw createAppError("A estrutura de dados da API de referência (Ambr) mudou. A ferramenta precisa de manutenção.", 500, "GENSHIN_API_STRUCTURE_CHANGED")
    }
    const characterEntry = Object.entries(characterItems).find(
      ([id, char]) => char.name.toLowerCase() === characterName.toLowerCase()
    )
    if (!characterEntry) {
      throw createAppError(`Não foi possível encontrar o personagem '${characterName}'. Verifique se o nome está correto e completo.`, 404, "GENSHIN_CHARACTER_NOT_FOUND")
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
      throw createAppError(`Não foi possível acessar os dados do UID ${uid}. O perfil pode ser privado ou não ter personagens na Vitrine.`, 403, "GENSHIN_PROFILE_PRIVATE_OR_EMPTY")
    }
    const playerData = playerResponse.data.avatarInfoList.find((char) => char.avatarId.toString() === characterId)
    if (!playerData) {
      throw createAppError(`Personagem '${characterName}' não encontrado na Vitrine de Personagens do UID ${uid}.`, 404, "GENSHIN_CHARACTER_NOT_IN_SHOWCASE")
    }
    const responseData = {
      characterGameInfo: filterReferenceData(referenceResponse.data.data),
      characterPlayerBuild: filterPlayerData(playerData)
    }
    console.log(`[TOOL_CALL] Análise concluída. Retornando dados combinados.`)
    return { status: 200, data: responseData }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[GENSHIN_SERVICE] Erro durante a execução:", error.message)
    throw createAppError("Ocorreu um erro ao conectar com os serviços de dados do Genshin Impact.", 503, "GENSHIN_API_ERROR")
  }
}

const genshinTool = {
  type: "function",
  function: {
    name: "genshinTool",
    description: "Use essa tool para buscar os dados atuais (arma, artefatos, status, etc.) do personagem que um jogador de Genshin Impact exibe em seu perfil no jogo, usando o UID fornecido. O assistente deve retornar em 2 sessões, a primeira mostra o necessário para upar o personagem e outra com os dados da build do personagem do jogador.",
    parameters: {
      type: "object",
      properties: {
        uid: {
          type: "string",
          description: "O UID (Identificador de Usuário) da conta do jogador no Genshin Impact. Exemplo: '123456789'."
        },
        characterName: {
          type: "string",
          description: "O nome do personagem de interesse para focar a resposta. Exemplo: 'Nahida'."
        }
      },
      required: ["uid", "characterName"]
    }
  }
}

module.exports = { genshinAnalysis, genshinTool }
