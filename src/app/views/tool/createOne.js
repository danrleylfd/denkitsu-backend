const Tool = require("../../models/tool")

const createAppError = require("../../../utils/errors")

const createOne = async (req, res) => {
  const { userID, user } = req
  if (user.plan === "pro") {
    const toolCount = await Tool.countDocuments({ author: userID })
    if (toolCount >= 3) throw createAppError("Você atingiu o limite de 3 ferramentas para o Plano Free. Faça upgrade para o Plano Pro para criar ferramentas ilimitadas.", 409, "TOOL_LIMIT_REACHED")
  }
  const toolData = { ...req.body, author: user._id }
  try {
    const tool = await Tool.create(toolData)
    return res.status(201).json(tool)
  } catch (error) {
    if (error.code === 11000) {
      throw createAppError("Você já possui uma ferramenta com este nome.", 409, "TOOL_NAME_EXISTS")
    }
    throw error
  }
}

module.exports = createOne
