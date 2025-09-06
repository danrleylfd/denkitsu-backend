const axios = require("axios")
const createAppError = require("../../errors")

const getNearEarthObjects = async ({ startDate, endDate }) => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw createAppError("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.", 500, "NASA_API_KEY_MISSING")
    const today = new Date().toISOString().split("T")[0]
    const finalStartDate = startDate || today
    const finalEndDate = endDate || finalStartDate
    console.log(`[TOOL_CALL] Buscando NEOs de ${finalStartDate} a ${finalEndDate}`)
    const { data } = await axios.get(`${process.env.NASA_API_URL}/neo/rest/v1/feed`, {
      params: {
        start_date: finalStartDate,
        end_date: finalEndDate,
        api_key: apiKey
      }
    })
    if (!data.near_earth_objects || Object.keys(data.near_earth_objects).length === 0) throw createAppError("Nenhum asteroide próximo à Terra foi encontrado para o período especificado.", 404, "ASTEROIDS_NOT_FOUND")
    const allObjects = Object.values(data.near_earth_objects).flat()
    const formattedObjects = allObjects.map(neo => ({
      name: neo.name,
      is_potentially_hazardous: neo.is_potentially_hazardous_asteroid,
      estimated_diameter_km: {
        min: neo.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3),
        max: neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)
      },
      close_approach: neo.close_approach_data[0] ? {
        date: neo.close_approach_data[0].close_approach_date_full,
        relative_velocity_kmh: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString("pt-BR"),
        miss_distance_km: parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString("pt-BR")
      } : null
    }))
    return { status: 200, data: { count: data.element_count, objects: formattedObjects } }
  } catch (error) {
    if (error.isOperational) throw error
    console.error("[ASTEROIDS_SERVICE] Erro ao buscar por asteroides:", error.response?.data || error.message)
    throw createAppError("Falha ao conectar com o serviço de rastreamento de asteroides da NASA.", 503, "NASA_NEO_API_ERROR")
  }
}

const asteroidsTool = {
  type: "function",
  function: {
    name: "asteroidsTool",
    description: "Busca por Asteroides Próximos à Terra (NEOs) dentro de um período específico. Se nenhuma data for fornecida, busca para o dia atual(informada pelo sistema). O intervalo máximo é 7 dias. Retorna uma lista de objetos com nome, diâmetro, se é potencialmente perigoso, e a que distância passará da Terra.",
    parameters: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "A data de início para a busca, no formato AAAA-MM-DD. Opcional."
        },
        endDate: {
          type: "string",
          description: "A data de fim para a busca, no formato AAAA-MM-DD. Opcional."
        }
      },
      required: []
    }
  }
}

module.exports = { getNearEarthObjects, asteroidsTool }
