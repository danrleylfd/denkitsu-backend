const Tool = require("../../models/tool")

const createOne = async (req, res) => {
  try {
    const { userID } = req
    const userToolCount = await Tool.countDocuments({ user: userID })
    if (userToolCount >= 6) throw new Error("TOOL_LIMIT_REACHED")
    const { name, description, alias, parameters, httpConfig } = req.body

    const tool = await Tool.create({
      user: userID,
      name,
      description,
      alias,
      parameters,
      httpConfig,
    })

    return res.status(201).json(tool)
  } catch (error) {
    console.error(`[CREATE_TOOL] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    if (error.code === 11000) {
      return res.status(409).json({
        error: { code: "TOOL_NAME_EXISTS", message: "Você já possui uma ferramenta com este nome." }
      })
    }
    const errorMessages = {
      TOOL_LIMIT_REACHED: { status: 403, message: "Limite de 6 ferramentas customizadas atingido." }
    }
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = errorMessages[error.message] || defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = createOne
