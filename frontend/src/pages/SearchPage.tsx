import { useState, useEffect, useRef } from "react"
import { buscarCartas, fetchCatalog } from "../services/cards.service"
import PokemonCard from "../components/PokemonCard"
import useCollection, { type Carta } from "../hooks/useCollection"



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
  const [cartas, setCartas] = useState<Carta[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [sets, setSets] = useState<SetInfo[]>([])
  const [setsLoading, setSetsLoading] = useState(false)
  const [setsSearch, setSetsSearch] = useState("")
  const [selectedSet, setSelectedSet] = useState<SetInfo | null>(null)
  const [setCards, setSetCards] = useState<Carta[]>([])
  const [setCardsLoading, setSetCardsLoading] = useState(false)

  const { addCard, collection } = useCollection()
  const collectionIds = new Set(collection.map(c => c.id))

  const [searchError, setSearchError] = useState('')
  const [setsError, setSetsError] = useState('')
  const [cardsError, setCardsError] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const active = useRef<AbortController | null>(null)
  useEffect(() => () => active.current?.abort(), [])
  function beginRequest() {
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    return controller
  }
  function changeTab(tab: 'nome' | 'sets') {
    active.current?.abort()
    setLoading(false); setSetsLoading(false); setSetCardsLoading(false)
    setAba(tab)
    if (tab === 'sets' && sets.length === 0) void loadSets()
  }
  async function loadSets() {
    const controller = beginRequest()
    setSetsLoading(true); setSetsError('')
    try { setSets(await fetchCatalog<SetInfo>('/sets', controller.signal)) }
    catch (error) { if (!controller.signal.aborted) setSetsError(error instanceof Error ? error.message : 'Não foi possível carregar os sets.') }
    finally { if (!controller.signal.aborted) setSetsLoading(false) }
  }
  async function handleSearch(term = name.trim()) {
    if (!term) return
    const controller = beginRequest()
    setLoading(true); setSearched(false); setSearchError(''); setCartas([]); setSubmittedName(term)
    try { setCartas(await buscarCartas<Carta>(term, controller.signal)); setSearched(true) }
    catch (error) { if (!controller.signal.aborted) setSearchError(error instanceof Error ? error.message : 'Não foi possível carregar as cartas.') }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }
  async function handleSelectSet(set: SetInfo) {
    const controller = beginRequest()
    setSelectedSet(set); setAba('set-cards'); setSetCards([]); setCardsError(''); setSetCardsLoading(true)
    try { setSetCards(await fetchCatalog<Carta>(`/sets/${encodeURIComponent(set.id)}/cards`, controller.signal)) }
    catch (error) { if (!controller.signal.aborted) setCardsError(error instanceof Error ? error.message : 'Não foi possível carregar as cartas deste set.') }
    finally { if (!controller.signal.aborted) setSetCardsLoading(false) }
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
        <div style={{ display: "flex", gap: "4px", background: "#181b1f", borderRadius: "8px", padding: "4px", flexWrap: "wrap", justifyContent: "center" }}>
          {([
            { key: "nome", label: "Nome ou número" },
            { key: "sets", label: "Por Set" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
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
              aria-label="Nome ou número da carta" placeholder="Charizard, 135 ou 136/135"
            />
            <p className="vault-caption">Use 135 para cartas nº 135 de qualquer set, ou 136/135 para incluir o total impresso. Também pode combinar: Charizard 136/135.</p>
            <button className="SearchButton" onClick={() => void handleSearch()} disabled={loading}>
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
          {loading && <p role="status">Buscando cartas… A primeira consulta pode levar até um minuto.</p>}
          {searchError && <CatalogError message={searchError} retry={() => void handleSearch(submittedName)} />}
          {searched && !loading && !searchError && cartas.length === 0 && (
            <p style={{ color: "#6b7280", marginTop: "40px" }}>Nenhuma carta encontrada para "{submittedName}".</p>
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
                updatedAt={carta.updatedAt} onAdd={() => addCard(carta)} onWish={() => addCard({...carta,status:'wishlist'})}
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
          {setsError && <CatalogError message={setsError} retry={() => void loadSets()} />}
          {!setsLoading && !setsError && sets.length === 0 && (
            <p style={{ color: "#ef4444", marginTop: "40px" }}>Nenhum set disponível no catálogo.</p>
          )}
          {!setsLoading && Object.entries(setsPorSerie).map(([serie, seriesSets]) => (
            <div key={serie} style={{ marginBottom: "40px" }}>
              <h3 style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", textAlign: "left" }}>
                {serie}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
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
              onClick={() => changeTab("sets")}
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

          {cardsError && <CatalogError message={cardsError} retry={() => void handleSelectSet(selectedSet)} />}
          {!setCardsLoading && !cardsError && setCards.length === 0 && <p>Nenhuma carta disponível neste set.</p>}
          {setCardsLoading && <p role="status" style={{ color: "#6b7280" }}>Carregando cartas… A consulta pode levar até um minuto.</p>}
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
                updatedAt={carta.updatedAt} onAdd={() => addCard(carta)} onWish={() => addCard({...carta,status:'wishlist'})}
                inCollection={collectionIds.has(carta.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
function CatalogError({ message, retry }: { message: string; retry: () => void }) {
  return <div className="collection-notice" role="alert"><p>{message}</p><button className="vault-secondary" onClick={retry}>Tentar novamente</button></div>
}
