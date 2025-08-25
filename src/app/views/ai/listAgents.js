const { AGENTS_DEFINITIONS } = require("../../../utils/constants/definitions")

const listAgents = async (req, res) => {
  try {
    return res.status(200).json(AGENTS_DEFINITIONS)
  } catch (error) {
    console.error(`[LIST_AGENTS_DEFINITIONS] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Ocorreu um erro interno no servidor." } })
  }
}

module.exports = listAgents
