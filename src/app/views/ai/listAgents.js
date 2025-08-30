const { AGENTS_DEFINITIONS } = require("../../../utils/constants/definitions")

const listAgents = async (req, res) => {
  return res.status(200).json({ backendAgents: AGENTS_DEFINITIONS })
}

module.exports = listAgents
