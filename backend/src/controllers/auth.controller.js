import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

// Gera um JWT com o id do usuário dentro
function gerarToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


export async function register(req, res) {
  const { name, email, password } = req.body

  if(!emailValido(email)) {
    return res.status(400).json({ error: "Email inválido." })
  }

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos." })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres." })
  }

  try {
    const jaExiste = await User.findOne({ email })
    if (jaExiste) {
      return res.status(409).json({ error: "Email já cadastrado." })
    }

    // bcrypt transforma a senha em hash — nunca salvamos a senha real
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({ name, email, passwordHash })

    const token = gerarToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Erro no registro:", error)
    res.status(500).json({ error: "Erro interno no servidor." })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  if(!emailValido(email)) {
    return res.status(400).json({ error: "Email inválido." })
  }

  if (!email || !password) {
    return res.status(400).json({ error: "Preencha email e senha." })
  }

  try {
    const user = await User.findOne({ email })

    // Mensagem genérica — não revela se o email existe ou não
    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos." })
    }

    const senhaCorreta = await bcrypt.compare(password, user.passwordHash)
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Email ou senha incorretos." })
    }

    const token = gerarToken(user._id)

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    res.status(500).json({ error: "Erro interno no servidor." })
  }
}

export async function getMe(req, res) {
  // req.userId é preenchido pelo middleware de auth
  try {
    const user = await User.findById(req.userId).select("-passwordHash")
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." })
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: "Erro interno." })
  }
}