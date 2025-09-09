const axios = require("axios")
const createAppError = require("../../errors")

const AMBR_API_BASE_URL = "https://gi.yatta.moe/api/v2/pt"

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
      for (let level = 2; level <= 10; level++) {
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

const getCharacterDetails = async ({ characterName }) => {
  try {
    console.log(`[TOOL_CALL] Buscando detalhes para o personagem: ${characterName}`)
    const listResponse = await axios.get(`${AMBR_API_BASE_URL}/avatar`)
    const characterItems = listResponse.data?.data?.items
    if (!characterItems) throw createAppError("A estrutura de dados da API de referência (Ambr) mudou. A ferramenta precisa de manutenção.", 500, "GENSHIN_API_STRUCTURE_CHANGED")
    const characterEntry = Object.entries(characterItems).find(
      ([id, char]) => char.name.toLowerCase() === characterName.toLowerCase()
    )
    if (!characterEntry) throw createAppError(`Não foi possível encontrar o personagem '${characterName}'. Verifique se o nome está correto e completo.`, 404, "GENSHIN_CHARACTER_NOT_FOUND")
    const characterId = characterEntry[0]
    const referenceResponse = await axios.get(`${AMBR_API_BASE_URL}/avatar/${characterId}`)
    const responseData = {
      characterGameInfo: filterReferenceData(referenceResponse.data.data)
    }
    console.log(`[TOOL_CALL] Detalhes do personagem encontrados. Retornando dados.`)
    return { status: 200, data: responseData }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[GENSHIN_SERVICE] Erro durante a execução:", error.message)
    throw createAppError("Ocorreu um erro ao conectar com os serviços de dados do Genshin Impact.", 503, "GENSHIN_API_ERROR")
  }
}

const genshinCharDetailsTool = {
  type: "function",
  function: {
    name: "genshinCharDetailsTool",
    description: "Use esta ferramenta para obter detalhes gerais sobre um personagem de Genshin Impact, como elemento, tipo de arma, materiais de ascensão e descrição de talentos. Requer apenas o nome do personagem.",
    parameters: {
      type: "object",
      properties: {
        characterName: {
          type: "string",
          description: "O nome do personagem de interesse para buscar os detalhes. Exemplo: 'Nahida'."
        }
      },
      required: ["characterName"]
    }
  }
}

module.exports = {
  getCharacterDetails,
  genshinCharDetailsTool
}
