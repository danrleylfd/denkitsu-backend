const axios = require("axios")

const getSpaceWeatherEvents = async ({ startDate, endDate }) => {
  try {
    const apiKey = process.env.NASA_API_KEY
    if (!apiKey) throw new Error("A chave da API da NASA (NASA_API_KEY) não foi configurada no servidor.")
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    const finalStartDate = startDate || sevenDaysAgo.toISOString().split("T")[0]
    const finalEndDate = endDate || today.toISOString().split("T")[0]
    console.log(`[TOOL_CALL] Buscando eventos de clima espacial de ${finalStartDate} a ${finalEndDate}`)
    const [flrResponse, cmeResponse] = await Promise.all([
      axios.get(`${process.env.NASA_API_URL}/DONKI/FLR`, { params: { startDate: finalStartDate, endDate: finalEndDate, api_key: apiKey } }),
      axios.get(`${process.env.NASA_API_URL}/DONKI/CME`, { params: { startDate: finalStartDate, endDate: finalEndDate, api_key: apiKey } })
    ])
    const solarFlares = flrResponse.data.map(flare => ({
      eventID: flare.flrID,
      beginTime: flare.beginTime,
      peakTime: flare.peakTime,
      classType: flare.classType,
      sourceLocation: flare.sourceLocation,
      link: flare.link
    }))
    const coronalMassEjections = cmeResponse.data.map(cme => ({
      eventID: cme.activityID,
      startTime: cme.startTime,
      sourceLocation: cme.sourceLocation,
      note: cme.note,
      link: cme.link
    }))
    return {
      status: 200,
      data: {
        solarFlares: solarFlares.length > 0 ? solarFlares : "Nenhuma erupção solar registrada no período.",
        coronalMassEjections: coronalMassEjections.length > 0 ? coronalMassEjections : "Nenhuma ejeção de massa coronal registrada no período."
      }
    }
  } catch (error) {
    console.error("[SPACE_WEATHER_SERVICE] Erro ao buscar eventos de clima espacial:", error.response?.data || error.message)
    throw new Error("TOOL_ERROR")
  }
}

const spaceWeatherTool = {
  type: "function",
  function: {
    name: "spaceWeatherTool",
    description: "Busca eventos de clima espacial, como Erupções Solares (FLR) e Ejeções de Massa Coronal (CME), para um determinado período. Se nenhuma data for fornecida, busca os eventos dos últimos 7 dias.",
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

module.exports = { getSpaceWeatherEvents, spaceWeatherTool }
