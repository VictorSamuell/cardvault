import { useState, useEffect } from "react"

export type Carta = {
  id: string
  name: string
  image: string | null
  price: number
  prices: Record<string, {
    low: number | null
    mid: number | null
    high: number | null
    market: number | null
  }>
  set: string | null
  number: string | null
  rarity: string | null
  tcgplayerUrl: string | null
  updatedAt: string | null
}

const API_URL = import.meta.env.VITE_API_URL || "https://cardvault-backend-plgs.onrender.com/api"

function getToken() {
  return localStorage.getItem("cardvault_token")
}

export default function useCollection() {
  const [collection, setCollection] = useState<Carta[]>([])
  const [loading, setLoading] = useState(true)

  // Busca a coleção do banco ao iniciar
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }

    fetch(`${API_URL}/collection`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCollection(data.cards ?? []))
      .catch(err => console.error("Erro ao carregar coleção:", err))
      .finally(() => setLoading(false))
  }, [])

  async function addCard(carta: Carta) {
    const token = getToken()
    if (!token) return

    const exists = collection.find(c => c.id === carta.id)
    if (exists) return

    try {
      const res = await fetch(`${API_URL}/collection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(carta),
      })

      const data = await res.json()
      if (res.ok) setCollection(data.cards)
    } catch (err) {
      console.error("Erro ao adicionar carta:", err)
    }
  }

  async function removeCard(id: string) {
    const token = getToken()
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/collection/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (res.ok) setCollection(data.cards)
    } catch (err) {
      console.error("Erro ao remover carta:", err)
    }
  }

  return { collection, loading, addCard, removeCard }
}