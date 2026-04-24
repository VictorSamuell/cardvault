import express from "express"
import { getSets, getCartasPorSet } from "../controllers/sets.controller.js"

const router = express.Router()

router.get("/sets", getSets)
router.get("/sets/:setId/cards", getCartasPorSet)

export default router