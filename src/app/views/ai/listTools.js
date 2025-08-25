const { TOOLS_DEFINITIONS } = require("../../../utils/constants/definitions")

const listTools = async (req, res) => {
  try {
    return res.status(200).json(TOOLS_DEFINITIONS)
  } catch (error) {
    console.error(`[LIST_TOOLS_DEFINITIONS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno no servidor." } })
  }
}

module.exports = listTools
