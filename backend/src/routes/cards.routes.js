import express from "express"
import { getCartas } from "../controllers/cards.controller.js"

const router = express.Router()

router.get("/cartas", getCartas)

export default router