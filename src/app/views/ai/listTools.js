const { INTERNAL_TOOLS_DEFINITIONS, TOOLS_DEFINITIONS } = require("../../../utils/constants/definitions")

const listTools = async (req, res) => {
  return res.status(200).json({
    internalTools: INTERNAL_TOOLS_DEFINITIONS,
    backendTools: TOOLS_DEFINITIONS
  })
}

module.exports = listTools
