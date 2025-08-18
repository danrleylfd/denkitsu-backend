const Tool = require("../../models/tool")

const createOne = async (req, res) => {
  try {
    const { userID } = req
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
    const defaultError = { status: 500, message: "Ocorreu um erro interno no servidor." }
    const { status, message } = defaultError
    return res.status(status).json({ error: { code: error.message, message } })
  }
}

module.exports = createOne
