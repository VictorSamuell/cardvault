import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import Collection from "../models/collection.model.js"

// GET /api/profile/:username — público
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "name username bio avatarUrl isPublic createdAt"
    )

    if (!user) return res.status(404).json({ error: "Perfil não encontrado" })

    // Se perfil privado e não é o próprio dono
    const requesterId = req.userId // pode ser undefined (não logado)
    if (!user.isPublic && String(user._id) !== String(requesterId)) {
      return res.status(403).json({ error: "Perfil privado" })
    }

    // Busca coleção se perfil for público
    let collection = []
    if (user.isPublic) {
      const col = await Collection.findOne({ userId: user._id })
      collection = col?.cards || []
    }

    res.json({ user, collection })
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar perfil" })
  }
}

// GET /api/profile/search?q=texto — público
export const searchProfiles = async (req, res) => {
  try {
    const q = req.query.q?.trim()
    if (!q || q.length < 2) return res.json([])

    const regex = new RegExp(q, "i")

    const users = await User.find({
      isPublic: true,
      $or: [{ username: regex }, { name: regex }],
    })
      .select("name username bio avatarUrl")
      .limit(20)

    res.json(users)
  } catch (err) {
    res.status(500).json({ error: "Erro na busca" })
  }
}

// PATCH /api/profile/me — protegida
export const updateProfile = async (req, res) => {
  try {
    const { bio, avatarUrl, isPublic, username } = req.body

    // Verifica se username já existe (de outro usuário)
    if (username) {
      const exists = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: req.userId },
      })
      if (exists) return res.status(409).json({ error: "Username já em uso" })
    }

    const updated = await User.findByIdAndUpdate(
      req.userId,
      {
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(isPublic !== undefined && { isPublic }),
        ...(username && { username: username.toLowerCase() }),
      },
      { new: true }
    ).select("name username bio avatarUrl isPublic")

    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar perfil" })
  }
}

// PATCH /api/profile/me/password — protegida
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Preencha todos os campos" })

    if (newPassword.length < 6)
      return res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres" })

    const user = await User.findById(req.userId)
    const match = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!match) return res.status(401).json({ error: "Senha atual incorreta" })

    user.passwordHash = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ message: "Senha alterada com sucesso" })
  } catch (err) {
    res.status(500).json({ error: "Erro ao alterar senha" })
  }
}