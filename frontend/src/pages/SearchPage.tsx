import { useState, useEffect } from "react"
import { buscarCartas } from "../services/cards.service"
import PokemonCard from "../components/PokemonCard"
import useCollection from "../hooks/useCollection"

const API_URL = "http://localhost:3000/api"

interface SetInfo {
  id: string
  name: string
  series: string
  logo: string | null
  symbol: string | null
  total: number
  releaseDate: string
}

export default function SearchPage() {
  const [aba, setAba] = useState<"nome" | "sets" | "set-cards">("nome")

  const [name, setName] = useState("")
  const [cartas, setCartas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [sets, setSets] = useState<SetInfo[]>([])
  const [setsLoading, setSetsLoading] = useState(false)
  const [setsSearch, setSetsSearch] = useState("")
  const [selectedSet, setSelectedSet] = useState<SetInfo | null>(null)
  const [setCards, setSetCards] = useState<any[]>([])
  const [setCardsLoading, setSetCardsLoading] = useState(false)

  const { addCard, collection } = useCollection()
  const collectionIds = new Set(collection.map(c => c.id))

  useEffect(() => {
    if (aba === "sets" && sets.length === 0) {
      setSetsLoading(true)
      fetch(`${API_URL}/sets`)
        .then(r => r.json())
        .then(data => setSets(Array.isArray(data) ? data : []))
        .catch(err => console.error("Erro sets:", err))
        .finally(() => setSetsLoading(false))
    }
  }, [aba])

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

  async function handleSelectSet(set: SetInfo) {
    setSelectedSet(set)
    setAba("set-cards")
    setSetCardsLoading(true)
    try {
      const res = await fetch(`${API_URL}/sets/${set.id}/cards`)
      const data = await res.json()
      setSetCards(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Erro ao buscar cartas do set:", err)
    } finally {
      setSetCardsLoading(false)
    }
  }

  const setsFiltrados = sets.filter(s =>
    s.name.toLowerCase().includes(setsSearch.toLowerCase()) ||
    s.series.toLowerCase().includes(setsSearch.toLowerCase())
  )

  const setsPorSerie = setsFiltrados.reduce<Record<string, SetInfo[]>>((acc, set) => {
    if (!acc[set.series]) acc[set.series] = []
    acc[set.series].push(set)
    return acc
  }, {})

  return (
    <div>
      <div className="SearchForm">
        <h1>CardVault</h1>
        <div style={{ display: "flex", gap: "4px", background: "#181b1f", borderRadius: "8px", padding: "4px" }}>
          {([
            { key: "nome", label: "Por Nome" },
            { key: "sets", label: "Por Set" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              style={{
                padding: "6px 20px", borderRadius: "6px", border: "none", cursor: "pointer",
                fontSize: "0.8rem", fontWeight: 500,
                background: (aba === key || (aba === "set-cards" && key === "sets")) ? "#22262a" : "transparent",
                color: (aba === key || (aba === "set-cards" && key === "sets")) ? "#ffffff" : "#6b7280",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {aba === "nome" && (
          <>
            <input
              className="SearchInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Digite o nome de um Pokémon"
            />
            <button className="SearchButton" onClick={handleSearch} disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </>
        )}

        {aba === "sets" && (
          <input
            className="SearchInput"
            value={setsSearch}
            onChange={(e) => setSetsSearch(e.target.value)}
            placeholder="Filtrar sets..."
          />
        )}
      </div>

      {/* ABA: Por Nome */}
      {aba === "nome" && (
        <>
          {searched && !loading && cartas.length === 0 && (
            <p style={{ color: "#6b7280", marginTop: "40px" }}>Nenhuma carta encontrada para "{name}".</p>
          )}
          {!loading && cartas.length > 0 && (
            <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "24px" }}>
              {cartas.length} cartas encontradas
            </p>
          )}
          <div className="grid">
            {cartas.map((carta) => (
              <PokemonCard
                key={carta.id} id={carta.id} name={carta.name} image={carta.image}
                price={carta.price} prices={carta.prices} set={carta.set}
                number={carta.number} rarity={carta.rarity} tcgplayerUrl={carta.tcgplayerUrl}
                updatedAt={carta.updatedAt} onAdd={() => addCard(carta)}
                inCollection={collectionIds.has(carta.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* ABA: Lista de Sets */}
      {aba === "sets" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          {setsLoading && <p style={{ color: "#6b7280", marginTop: "40px" }}>Carregando sets...</p>}
          {!setsLoading && sets.length === 0 && (
            <p style={{ color: "#ef4444", marginTop: "40px" }}>Erro ao carregar sets. Verifique se o backend está rodando.</p>
          )}
          {!setsLoading && Object.entries(setsPorSerie).map(([serie, seriesSets]) => (
            <div key={serie} style={{ marginBottom: "40px" }}>
              <h3 style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", textAlign: "left" }}>
                {serie}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {seriesSets.map(set => (
                  <div
                    key={set.id}
                    onClick={() => handleSelectSet(set)}
                    style={{
                      background: "#181b1f", borderRadius: "10px", padding: "16px",
                      cursor: "pointer", textAlign: "left", transition: "transform 0.2s",
                      border: "0.5px solid #22262a",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    {set.logo ? (
                      <img src={set.logo} alt={set.name}
                        style={{ width: "100%", height: "50px", objectFit: "contain", marginBottom: "12px" }} />
                    ) : (
                      <div style={{ height: "50px", marginBottom: "12px", display: "flex", alignItems: "center" }}>
                        {set.symbol && <img src={set.symbol} alt="" style={{ height: "30px" }} />}
                      </div>
                    )}
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#fff", margin: "0 0 4px" }}>{set.name}</p>
                    <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>{set.total} cartas · {set.releaseDate}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA: Cartas do Set */}
      {aba === "set-cards" && selectedSet && (
        <>
          <div style={{ maxWidth: "1200px", margin: "0 auto 32px", padding: "0 20px", textAlign: "left" }}>
            <button
              onClick={() => setAba("sets")}
              style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "0.85rem", padding: 0, marginBottom: "16px" }}
            >
              ← Voltar para sets
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {selectedSet.logo && (
                <img src={selectedSet.logo} alt={selectedSet.name} style={{ height: "40px", objectFit: "contain" }} />
              )}
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{selectedSet.name}</h2>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                  {selectedSet.series} · {selectedSet.total} cartas · {selectedSet.releaseDate}
                </p>
              </div>
            </div>
          </div>

          {setCardsLoading && <p style={{ color: "#6b7280" }}>Carregando cartas...</p>}
          {!setCardsLoading && setCards.length > 0 && (
            <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "24px" }}>
              {setCards.length} cartas
            </p>
          )}

          <div className="grid">
            {setCards.map((carta) => (
              <PokemonCard
                key={carta.id} id={carta.id} name={carta.name} image={carta.image}
                price={carta.price} prices={carta.prices} set={carta.set}
                number={carta.number} rarity={carta.rarity} tcgplayerUrl={carta.tcgplayerUrl}
                updatedAt={carta.updatedAt} onAdd={() => addCard(carta)}
                inCollection={collectionIds.has(carta.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}