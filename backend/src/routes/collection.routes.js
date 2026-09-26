import express from "express"
import { getCollection, addCard, removeCard, updateCard } from "../controllers/collection.controller.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = express.Router()

// Todas as rotas de coleção precisam de login
router.use(authMiddleware)

router.get("/collection", getCollection)
router.post("/collection", addCard)
router.delete("/collection/:cardId", removeCard)
router.patch("/collection/:cardId", updateCard)

export default router
