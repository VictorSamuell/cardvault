import { useState } from "react"
import { buscarCartas } from "../services/cards.service"
import PokemonCard from "../components/PokemonCard"
import useCollection from "../hooks/useCollection"

export default function SearchPage() {
  const [name, setName] = useState("")
  const [cartas, setCartas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const { addCard, collection } = useCollection()

  async function handleSearch() {
    if (!name.trim()) return

    try {
      setLoading(true)
      setSearched(false)
      const resultado = await buscarCartas(name)
      setCartas(resultado)
    } catch (error) {
      console.error("Erro ao buscar cartas", error)
      setCartas([])
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch()
  }

  const collectionIds = new Set(collection.map(c => c.id))

  return (
    <div>
      <div className="SearchForm">
        <h1>CardVault</h1>

        <input
          className="SearchInput"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o nome de um Pokémon"
        />

        <button className="SearchButton" onClick={handleSearch} disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {searched && !loading && cartas.length === 0 && (
        <p style={{ color: "#6b7280", marginTop: "40px" }}>
          Nenhuma carta encontrada para "{name}".
        </p>
      )}

      {!loading && cartas.length > 0 && (
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "24px" }}>
          {cartas.length} cartas encontradas
        </p>
      )}

      <div className="grid">
        {cartas.map((carta) => (
          <PokemonCard
            key={carta.id}
            id={carta.id}
            name={carta.name}
            image={carta.image}
            price={carta.price}
            prices={carta.prices}
            set={carta.set}
            number={carta.number}
            rarity={carta.rarity}
            tcgplayerUrl={carta.tcgplayerUrl}
            updatedAt={carta.updatedAt}
            onAdd={() => addCard(carta)}
            inCollection={collectionIds.has(carta.id)}
          />
        ))}
      </div>
    </div>
  )
}