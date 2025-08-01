const { getResources } = require("../../../utils/mcp")

const listResources = async (req, res) => {
  try {
    const resources = getResources()
    return res.status(200).json(resources)
  } catch (error) {
    console.error(`[MCP_LIST_RESOURCES] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno no servidor." } })
  }
}

module.exports = listResources
