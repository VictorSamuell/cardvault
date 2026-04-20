import { useState, useEffect } from "react"

type Carta = { 
    id: string;
    name: string;
    image: string | null;
    price?: number;
    prices?: Record<string, any>; 
    set?: string | null;          
    number?: string | null;         
    rarity?: string | null;       
    tcgplayerUrl?: string | null; 
    updatedAt?: string | null;    
}

export default function useCollection() {

  const [collection, setCollection] = useState<Carta[]>([])

  useEffect(() => {

    const saved = localStorage.getItem("cardvault_collection")

    if (saved) {
      setCollection(JSON.parse(saved))
    }

  }, [])

  function addCard(carta: Carta) {

    console.log("adicionando carta", carta)
    const exists = collection.find(c => c.id === carta.id)
    //se ja existir
    if (exists) return

    const updated = [...collection, carta]

    setCollection(updated)

    localStorage.setItem(
      "cardvault_collection",
      JSON.stringify(updated)
    )
  }

  function removeCard(id: string) {

    const updated = collection.filter(c => c.id !== id)

    setCollection(updated)

    localStorage.setItem(
      "cardvault_collection",
      JSON.stringify(updated)
    )
  }

  return {
    collection,
    addCard,
    removeCard
  }

}