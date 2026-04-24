import { buscarSets, buscarCartasPorSet } from "../services/sets.service.js"

export async function getSets(req, res) {
  try {
    const sets = await buscarSets()
    res.json(sets)
  } catch (error) {
    console.error("Erro ao buscar sets:", error)
    res.status(500).json({ error: "Erro ao buscar sets." })
  }
}

export async function getCartasPorSet(req, res) {
  const { setId } = req.params
  try {
    const cartas = await buscarCartasPorSet(setId)
    res.json(cartas)
  } catch (error) {
    console.error("Erro ao buscar cartas do set:", error)
    res.status(500).json({ error: "Erro ao buscar cartas do set." })
  }
}