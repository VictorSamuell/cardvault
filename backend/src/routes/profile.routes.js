import express from "express"
import { authMiddleware } from "../middleware/auth.middleware.js"
import {
  getProfile,
  searchProfiles,
  updateProfile,
  changePassword,
} from "../controllers/profile.controller.js"

const router = express.Router()

// Protegidas — só o dono pode editar
router.patch("/profile/me/password", authMiddleware, changePassword)
router.patch("/profile/me", authMiddleware, updateProfile)

// Pública — busca perfis por nome ou username
router.get("/profile/search", searchProfiles)

// Pública — pega perfil de um usuário pelo username
router.get("/profile/:username", getProfile)

export default router