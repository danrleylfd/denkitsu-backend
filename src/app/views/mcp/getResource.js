const { getResourceById } = require("../../../utils/mcp")

const getResource = async (req, res) => {
  try {
    const { resourceId } = req.params
    const resource = getResourceById(resourceId)
    if (!resource) {
      return res.status(404).json({ error: { code: "RESOURCE_NOT_FOUND", message: "O recurso solicitado não foi encontrado." } })
    }
    return res.status(200).json(resource)
  } catch (error) {
    console.error(`[MCP_GET_RESOURCE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno no servidor." } })
  }
}

module.exports = getResource
