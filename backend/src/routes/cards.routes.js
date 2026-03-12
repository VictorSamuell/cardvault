import express from "express"
import { getCartas , getCartaPorId } from "../controllers/cards.controller.js"

const router = express.Router()

router.get("/cartas", getCartas)
router.get("/cartas/:id", getCartaPorId)

export default router