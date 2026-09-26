import SetProgress from '../components/SetProgress'
import { useState } from "react"
import CollectionEditor from '../components/CollectionEditor'
import type { Carta } from '../hooks/useCollection'
import PokemonCard from "../components/PokemonCard"
import useCollection from "../hooks/useCollection"

function BarChart({ data }: { data: { label: string; value: number; max: number }[] }) {
  if (data.length === 0) return null
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {data.map(({ label, value, max }) => (
        <div key={label}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>{label}</span>
            <span style={{ fontSize: "12px", color: "#ffffff", fontWeight: 500 }}>{value}</span>
          </div>
          <div style={{ background: "#22262a", borderRadius: "99px", height: "4px", overflow: "hidden" }}>
            <div style={{
              width: `${(value / max) * 100}%`,
              height: "100%",
              background: "#1D9E75",
              borderRadius: "99px",
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total === 0) return null
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const segments = data.map((d, index) => {
    const dash = (d.value / total) * circumference
    const offset = data.slice(0, index).reduce((sum, item) => sum + item.value / total * circumference, 0)
    const seg = { ...d, dash, offset }
    return seg
  })
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={radius} fill="none" stroke="#22262a" strokeWidth="12" />
        {segments.map((seg) => (
          <circle key={seg.label} cx={60} cy={60} r={radius} fill="none"
            stroke={seg.color} strokeWidth="12"
            strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
            strokeDashoffset={-seg.offset + circumference * 0.25} />
        ))}
        <text x="60" y="60" textAnchor="middle" dy="0.35em" fill="#ffffff" fontSize="14" fontWeight="500">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#9ca3af" }}>{seg.label}</span>
            <span style={{ fontSize: "12px", color: "#ffffff", marginLeft: "auto" }}>
              {((seg.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CollectionPage({ onExplore }: { onExplore: () => void }) {
  const { collection: allCards, removeCard, loading, error, reload, saving } = useCollection()
  const [list, setList] = useState<'owned' | 'wishlist'>('owned')
  const [editing, setEditing] = useState<Carta | null>(null)
  const collection = allCards.filter(c => (c.status ?? 'owned') === list)
  const [query, setQuery] = useState("")
  const [setFilter, setSetFilter] = useState("")
  const [rarityFilter, setRarityFilter] = useState("")
  const [sort, setSort] = useState("price-desc")
  const [removing, setRemoving] = useState<string | null>(null)
  const sets = [...new Set(collection.map(c => c.set).filter(Boolean))].sort() as string[]
  const rarities = [...new Set(collection.map(c => c.rarity).filter(Boolean))].sort() as string[]
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const visible = collection.filter(c => normalize(c.name).includes(normalize(query)) && (!setFilter || c.set === setFilter) && (!rarityFilter || c.rarity === rarityFilter))
    .sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name, 'pt-BR') : sort === 'price-asc' ? (a.price || 0)-(b.price || 0) : (b.price || 0)-(a.price || 0))

  function exportCollection() {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), cards: allCards }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'cardvault-colecao.json'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const [view, setView] = useState<"grid" | "stats" | "sets">("grid")

  const cartasOrdenadas = [...collection].sort((a, b) => (b.price || 0) - (a.price || 0))
  const total = collection.reduce((sum, c) => sum + (c.price || 0) * (c.quantity ?? 1), 0)
  const cartaMaisCara = cartasOrdenadas.find(c => c.price > 0)
  const cartaMaisBarata = [...cartasOrdenadas].reverse().find(c => c.price > 0)
  const semPreco = collection.filter(c => !c.price || c.price === 0).length
  const comPreco = collection.length - semPreco
  const pricedUnits = collection.reduce((sum,c) => sum + (c.price > 0 ? (c.quantity ?? 1) : 0), 0)
  const mediaPreco = pricedUnits > 0 ? total / pricedUnits : 0
  const top5 = cartasOrdenadas.filter(c => c.price > 0).slice(0, 5)

  const raridadeMap: Record<string, number> = {}
  collection.forEach(c => { const r = c.rarity || "Desconhecida"; raridadeMap[r] = (raridadeMap[r] || 0) + 1 })
  const raridadeData = Object.entries(raridadeMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([label, value]) => ({ label, value, max: Math.max(...Object.values(raridadeMap)) }))

  const setMap: Record<string, number> = {}
  collection.forEach(c => { const s = c.set || "Desconhecido"; setMap[s] = (setMap[s] || 0) + 1 })
  const setData = Object.entries(setMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([label, value]) => ({ label, value, max: Math.max(...Object.values(setMap)) }))

  const donutData = [
    { label: "Com preço", value: comPreco, color: "#1D9E75" },
    { label: "Sem preço", value: semPreco, color: "#374151" },
  ].filter(d => d.value > 0)

  if (loading) return <section className="vault-state" role="status"><span className="vault-eyebrow">SEU LUGAR</span><h1>Preparando sua coleção…</h1><p>Buscando suas cartas e estatísticas.</p></section>
  if (error && allCards.length === 0) return <section className="vault-state"><h1>Não conseguimos abrir sua coleção</h1><p>{error}</p><button className="vault-primary" onClick={() => void reload()}>Tentar novamente</button></section>
  if (allCards.length === 0) return <section className="vault-state"><span className="vault-eyebrow">SEU SONHO COMEÇA AQUI</span><h1>Cada carta conta uma história.</h1><p>Encontre suas cartas favoritas e comece a organizar sua coleção.</p><button className="vault-primary" onClick={onExplore}>Explorar cartas</button></section>

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "40px", flexWrap: "wrap" }}>
        <div className="vault-heading"><span className="vault-eyebrow">SUA COLEÇÃO PESSOAL</span><h1 style={{ margin: 0 }}>Minha Coleção</h1><p>Organize suas descobertas. Acompanhe cada carta.</p></div>
        <button className="vault-secondary" onClick={exportCollection}>Exportar coleção</button>
        <div style={{ display: "flex", gap: "4px", background: "#181b1f", borderRadius: "8px", padding: "4px", flexWrap: "wrap", justifyContent: "center" }}>
          {(["grid", "stats", "sets"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: 500,
              background: view === v ? "#22262a" : "transparent",
              color: view === v ? "#ffffff" : "#6b7280",
            }}>
              {v === "grid" ? "Cartas" : v === "sets" ? "Completar sets" : "Dashboard"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", maxWidth: "1200px", margin: "0 auto 40px", padding: "0 20px" }}>
        {[
          { label: "Total de cartas", value: collection.length, color: "#ffffff" },
          { label: "Valor total", value: `$${total.toFixed(2)}`, color: "#1D9E75" },
          { label: "Preço médio", value: `$${mediaPreco.toFixed(2)}`, color: "#9ca3af" },
          { label: "Sem preço", value: semPreco, color: semPreco > 0 ? "#9ca3af" : "#1D9E75" },
        ].map(({ label, value, color }) => (
          <div key={label} style={statCard}>
            <span style={statLabel}>{label}</span>
            <span style={{ ...statValue, color }}>{value}</span>
          </div>
        ))}
      </div>

      <div className="vault-list-tabs"><button className="vault-secondary" aria-pressed={list==='owned'} onClick={()=>{setList('owned');setSetFilter('');setRarityFilter('')}}>Minha coleção ({allCards.filter(c=>c.status!=='wishlist').length})</button><button className="vault-secondary" aria-pressed={list==='wishlist'} onClick={()=>{setList('wishlist');setSetFilter('');setRarityFilter('')}}>Desejos ({allCards.filter(c=>c.status==='wishlist').length})</button></div>
      <p className="vault-caption">{collection.reduce((sum,c)=>sum+(c.quantity??1),0)} unidades nesta lista · Valor pago informado: {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(collection.reduce((sum,c)=>sum+(c.purchasePrice??0)*(c.quantity??1),0))}</p>
      {editing && <CollectionEditor key={editing.id} card={editing} onClose={()=>setEditing(null)} />}
      <p className="vault-caption">Valores de referência em USD, conforme os dados salvos ao adicionar as cartas. Não representam uma cotação atual ou preço de venda garantido.</p>
      {view === "grid" && <div className="vault-toolbar">
        <label>Buscar na coleção<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nome da carta…" /></label>
        <label>Set<select value={setFilter} onChange={e=>setSetFilter(e.target.value)}><option value="">Todos os sets</option>{sets.map(s=><option key={s}>{s}</option>)}</select></label>
        <label>Raridade<select value={rarityFilter} onChange={e=>setRarityFilter(e.target.value)}><option value="">Todas as raridades</option>{rarities.map(r=><option key={r}>{r}</option>)}</select></label>
        <label>Ordenar<select value={sort} onChange={e=>setSort(e.target.value)}><option value="price-desc">Maior valor</option><option value="price-asc">Menor valor</option><option value="name">Nome A–Z</option></select></label>
        <p aria-live="polite">{visible.length} de {collection.length} cartas</p>
        {(query || setFilter || rarityFilter) && <button className="vault-secondary" onClick={()=>{setQuery('');setSetFilter('');setRarityFilter('')}}>Limpar filtros</button>}
      </div>}
      {view === "grid" && visible.length === 0 && <p className="vault-state">Nenhuma carta corresponde aos filtros.</p>}
      {removing && <div className="vault-confirm" role="alert"><span>Remover {collection.find(c=>c.id===removing)?.name} da coleção?</span><button disabled={saving} onClick={()=>{void removeCard(removing);setRemoving(null)}}>Confirmar remoção</button><button onClick={()=>setRemoving(null)}>Cancelar</button></div>}
      {view === "grid" && (
        <div className="grid">
          {visible.map((carta) => (
            <div key={carta.id} className="vault-card-entry"><PokemonCard id={carta.id} name={carta.name} image={carta.image}
              price={carta.price} prices={carta.prices} set={carta.set} number={carta.number}
              rarity={carta.rarity} tcgplayerUrl={carta.tcgplayerUrl} updatedAt={carta.updatedAt}
              onRemove={() => setRemoving(carta.id)} inCollection={true} />
            <div className="vault-card-meta"><span>{carta.quantity ?? 1}× · {carta.language ?? 'Idioma não informado'}</span><button className="vault-secondary" onClick={()=>setEditing(carta)}>Editar carta</button></div></div>
          ))}
        </div>
      )}

      {view === "sets" && <SetProgress />}
      {view === "stats" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "16px" }}>

            <div style={dashCard}>
              <p style={dashLabel}>Carta mais valiosa</p>
              {cartaMaisCara ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {cartaMaisCara.image && <img src={cartaMaisCara.image} alt={cartaMaisCara.name} style={{ width: "60px", borderRadius: "6px" }} />}
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#fff", margin: "0 0 4px" }}>{cartaMaisCara.name}</p>
                    <p style={{ fontSize: "22px", fontWeight: 500, color: "#1D9E75", margin: 0 }}>${cartaMaisCara.price.toFixed(2)}</p>
                    {cartaMaisCara.rarity && <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}>{cartaMaisCara.rarity}</p>}
                  </div>
                </div>
              ) : <p style={{ color: "#6b7280" }}>—</p>}
            </div>

            <div style={dashCard}>
              <p style={dashLabel}>Carta mais barata</p>
              {cartaMaisBarata ? (
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {cartaMaisBarata.image && <img src={cartaMaisBarata.image} alt={cartaMaisBarata.name} style={{ width: "60px", borderRadius: "6px" }} />}
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 500, color: "#fff", margin: "0 0 4px" }}>{cartaMaisBarata.name}</p>
                    <p style={{ fontSize: "22px", fontWeight: 500, color: "#9ca3af", margin: 0 }}>${cartaMaisBarata.price.toFixed(2)}</p>
                    {cartaMaisBarata.rarity && <p style={{ fontSize: "11px", color: "#6b7280", margin: "4px 0 0" }}>{cartaMaisBarata.rarity}</p>}
                  </div>
                </div>
              ) : <p style={{ color: "#6b7280" }}>—</p>}
            </div>

            <div style={dashCard}>
              <p style={dashLabel}>Top 5 mais valiosas</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {top5.length === 0
                  ? <p style={{ color: "#6b7280", fontSize: "13px" }}>Nenhuma carta com preço.</p>
                  : top5.map((carta, i) => (
                    <div key={carta.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "12px", color: "#4b5563", width: "16px" }}>#{i + 1}</span>
                      {carta.image && <img src={carta.image} alt={carta.name} style={{ width: "32px", borderRadius: "4px" }} />}
                      <span style={{ fontSize: "13px", color: "#d1d5db", flex: 1, textAlign: "left" }}>{carta.name}</span>
                      <span style={{ fontSize: "13px", color: "#1D9E75", fontWeight: 500 }}>${carta.price.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div style={dashCard}>
              <p style={dashLabel}>Cobertura de preços</p>
              <DonutChart data={donutData} />
            </div>

            <div style={dashCard}>
              <p style={dashLabel}>Por raridade</p>
              <BarChart data={raridadeData} />
            </div>

            <div style={dashCard}>
              <p style={dashLabel}>Por set (top 5)</p>
              <BarChart data={setData} />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

const statCard: React.CSSProperties = { background: "#181b1f", borderRadius: "10px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "6px", textAlign: "left" }
const dashCard: React.CSSProperties = { background: "#181b1f", borderRadius: "12px", padding: "24px", textAlign: "left" }
const statLabel: React.CSSProperties = { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }
const statValue: React.CSSProperties = { fontSize: "1.5rem", fontWeight: 500, color: "#ffffff" }
const dashLabel: React.CSSProperties = { fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500, margin: "0 0 16px" }
