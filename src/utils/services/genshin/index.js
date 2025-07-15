const axios = require("axios")

const filterReferenceData = (data) => {
  if (!data) return null;

  // Mapeia IDs para nomes
  const mapIdToName = (id) => data.items[id]?.name || `Unknown Item (ID: ${id})`;

  // Calcula materiais de ascensão (excluindo livros de talento e coroas)
  const calculateUpgradeMaterials = () => {
    const totals = {};

    // Identifica materiais de talento para exclusão
    const talentMaterialIds = new Set();
    const firstTalent = Object.values(data.talent)[0];

    if (firstTalent?.promote) {
      for (const level in firstTalent.promote) {
        const costItems = firstTalent.promote[level]?.costItems;
        if (costItems) {
          Object.keys(costItems).forEach(id => talentMaterialIds.add(id));
        }
      }
    }

    // Soma materiais de ascensão, excluindo os de talento
    Object.entries(data.ascension || {}).forEach(([id, amount]) => {
      if (!talentMaterialIds.has(id)) {
        totals[id] = (totals[id] || 0) + amount;
      }
    });

    return Object.entries(totals).map(([id, amount]) => ({
      name: mapIdToName(id),
      amount
    }));
  };

  // Calcula materiais totais para talentos
  const calculateTotalTalentMaterials = () => {
    const materialsTotal = {};
    const talent = Object.values(data.talent)[0];

    if (talent?.promote) {
      // Percorre todos os níveis de promoção (2 a 10)
      for (let level = 2; level <= 10; level++) {
        const costItems = talent.promote[level]?.costItems;
        if (costItems) {
          Object.entries(costItems).forEach(([id, amount]) => {
            materialsTotal[id] = (materialsTotal[id] || 0) + amount;
          });
        }
      }
    }

    return Object.entries(materialsTotal).map(([id, amount]) => ({
      name: mapIdToName(id),
      amount
    }));
  };

  // Calcula Mora total (ascensão + talentos)
  const calculateTotalMora = () => {
    let total = 0;

    // Mora de ascensão
    Object.values(data.upgrade?.promote || []).forEach(level => {
      if (level.coinCost) total += level.coinCost;
    });

    // Mora de talentos (para um talento)
    const talent = Object.values(data.talent)[0];
    if (talent?.promote) {
      for (let level = 2; level <= 10; level++) {
        const promoteData = talent.promote[level];
        if (promoteData?.coinCost) total += promoteData.coinCost;
      }
    }

    return total;
  };

  const result = {
    name: data.name,
    element: data.element,
    weaponType: data.weaponType,
    characterXP: 419,
    totalMora: calculateTotalMora(),
    upgradeMaterials: calculateUpgradeMaterials(),
    talentMaterials: calculateTotalTalentMaterials(),
    talents: Object.values(data.talent).map(t => ({
      name: t.name,
      description: t.description.replace(/<[^>]+>/g, '')
    }))
  }
  console.log(result)
  return result
};

const filterPlayerData = (data) => {
  if (!data) return null
  const weapon = data.equipList.find((e) => e.flat.itemType === "ITEM_WEAPON")
  const artifacts = data.equipList.filter((e) => e.flat.itemType === "ITEM_RELIQUARY")

  return {
    level: data.propMap["4001"].val,
    constellation: data.talentIdList ? (Object.keys(data.proudSkillExtraLevelMap || {}).length > 0 ? 6 : data.talentIdList.length - 3) : 0,
    skillLevels: data.skillLevelMap,
    weapon: {
      name: weapon.flat.nameTextMapHash,
      level: weapon.weapon.level,
      refinement: weapon.weapon.affixMap ? Object.values(weapon.weapon.affixMap)[0] + 1 : 1
    },
    artifacts: artifacts.map((art) => ({
      type: art.flat.equipType,
      setName: art.flat.setNameTextMapHash,
      mainStat: art.flat.reliquaryMainstat.mainPropId,
      mainStatValue: art.flat.reliquaryMainstat.statValue,
      level: art.reliquary.level,
      substats: art.flat.reliquarySubstats?.map((sub) => ({
        stat: sub.appendPropId,
        value: sub.statValue
      }))
    })),
    stats: data.fightPropMap
  }
}

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
      characterInfo: filterReferenceData(referenceResponse.data.data),
      playerCharacterBuild: filterPlayerData(playerData)
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
    description: "Busca os dados atuais (arma, artefatos, status, etc.) do personagem que um jogador de Genshin Impact exibe em seu perfil no jogo, usando o UID fornecido. O assistente deve retornar em 2 sessões, uma com os dados de referência do personagem e outra com os dados da build do personagem do jogador.",
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
