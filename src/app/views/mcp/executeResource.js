const { executeResource } = require("../../../utils/mcp")

const execute = async (req, res) => {
  try {
    const { resourceId } = req.params
    const params = req.body
    const result = await executeResource(resourceId, params)
    return res.status(200).json(result)
  } catch (error) {
    console.error(`[MCP_EXECUTE_RESOURCE] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.message === "RESOURCE_NOT_FOUND") {
      return res.status(404).json({ error: { code: "RESOURCE_NOT_FOUND", message: "O recurso que você tentou executar não foi encontrado." } })
    }
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno no servidor." } })
  }
}

module.exports = execute
