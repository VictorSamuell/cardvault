import Collection from "../models/collection.model.js"
import { validateMetadata } from '../services/collection-metadata.js'

export async function updateCard(req, res) {
  let fields
  try { fields = validateMetadata(req.body) }
  catch (error) { return res.status(400).json({ error: error.message }) }
  try {
    const updates = Object.fromEntries(Object.entries(fields).map(([key, value]) => [`cards.$.${key}`, value]))
    const col = await Collection.findOneAndUpdate(
      { userId: req.userId, 'cards.id': req.params.cardId },
      { $set: updates }, { new: true, runValidators: true },
    )
    if (!col) return res.status(404).json({ error: 'Carta não encontrada na sua coleção.' })
    return res.json({ cards: col.cards })
  } catch { return res.status(500).json({ error: 'Não foi possível atualizar a carta.' }) }
}

// Busca a coleção do usuário logado
export async function getCollection(req, res) {
  try {
    const col = await Collection.findOne({ userId: req.userId })
    res.json({ cards: col?.cards ?? [] })
  } catch (error) {
    console.error("Erro ao buscar coleção:", error)
    res.status(500).json({ error: "Erro ao buscar coleção." })
  }
}

// Adiciona uma carta na coleção
export async function addCard(req, res) {
  const carta = req.body

  if (!carta?.id || !carta?.name) {
    return res.status(400).json({ error: "Dados da carta inválidos." })
  }
  try {
    const metadata = Object.fromEntries(['quantity', 'condition', 'language', 'purchasePrice', 'status', 'notes'].filter(key => carta[key] !== undefined).map(key => [key, carta[key]]))
    if (Object.keys(metadata).length) validateMetadata(metadata)
  } catch (error) { return res.status(400).json({ error: error.message }) }

  try {
    let col = await Collection.findOne({ userId: req.userId })

    if (!col) {
      // Primeira carta — cria o documento
      col = await Collection.create({ userId: req.userId, cards: [carta] })
    } else {
      // Verifica se já existe
      const jaExiste = col.cards.some(c => c.id === carta.id)
      if (jaExiste) {
        return res.status(409).json({ error: "Carta já está na coleção." })
      }
      col.cards.push(carta)
      await col.save()
    }

    res.status(201).json({ cards: col.cards })
  } catch (error) {
    console.error("Erro ao adicionar carta:", error)
    res.status(500).json({ error: "Erro ao adicionar carta." })
  }
}

// Remove uma carta da coleção pelo id
export async function removeCard(req, res) {
  const { cardId } = req.params

  try {
    const col = await Collection.findOne({ userId: req.userId })

    if (!col) {
      return res.status(404).json({ error: "Coleção não encontrada." })
    }

    col.cards = col.cards.filter(c => c.id !== cardId)
    await col.save()

    res.json({ cards: col.cards })
  } catch (error) {
    console.error("Erro ao remover carta:", error)
    res.status(500).json({ error: "Erro ao remover carta." })
  }
}
