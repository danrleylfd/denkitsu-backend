const User = require("../../models/auth")

const unlinkGithub = async (req, res) => {
  try {
    const { userID } = req // O ID vem do authMiddleware, garantindo que é o usuário logado

    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." })
    }

    // Remove a referência ao ID do GitHub
    user.githubId = undefined
    await user.save()

    // Retorna o usuário atualizado para o frontend
    const updatedUser = user.toObject()
    delete updatedUser.password // Garante que a senha nunca seja enviada

    return res.status(200).json({ user: updatedUser })
  } catch (error) {
    console.error(`[UNLINK_GITHUB] ${new Date().toISOString()} -`, { error: error.message, stack: error.stack })
    return res.status(500).json({ error: "Erro interno do servidor." })
  }
}

module.exports = unlinkGithub
