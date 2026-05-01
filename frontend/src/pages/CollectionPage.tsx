import { useState } from "react"
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
  let offset = 0
  const segments = data.map((d) => {
    const dash = (d.value / total) * circumference
    const seg = { ...d, dash, offset }
    offset += dash
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

export default function CollectionPage() {
  const { collection, removeCard } = useCollection()
  const [view, setView] = useState<"grid" | "stats">("grid")

  const cartasOrdenadas = [...collection].sort((a, b) => (b.price || 0) - (a.price || 0))
  const total = collection.reduce((sum, c) => sum + (c.price || 0), 0)
  const cartaMaisCara = cartasOrdenadas.find(c => c.price > 0)
  const cartaMaisBarata = [...cartasOrdenadas].reverse().find(c => c.price > 0)
  const semPreco = collection.filter(c => !c.price || c.price === 0).length
  const comPreco = collection.length - semPreco
  const mediaPreco = comPreco > 0 ? total / comPreco : 0
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

  if (collection.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px", color: "#6b7280" }}>
        <p style={{ fontSize: "1rem" }}>Sua coleção está vazia.</p>
        <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>Busque cartas e adicione aqui.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "40px", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Minha Coleção</h1>
        <div style={{ display: "flex", gap: "4px", background: "#181b1f", borderRadius: "8px", padding: "4px", flexWrap: "wrap", justifyContent: "center" }}>
          {(["grid", "stats"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: 500,
              background: view === v ? "#22262a" : "transparent",
              color: view === v ? "#ffffff" : "#6b7280",
            }}>
              {v === "grid" ? "Cartas" : "Dashboard"}
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

      {view === "grid" && (
        <div className="grid">
          {cartasOrdenadas.map((carta) => (
            <PokemonCard key={carta.id} id={carta.id} name={carta.name} image={carta.image}
              price={carta.price} prices={carta.prices} set={carta.set} number={carta.number}
              rarity={carta.rarity} tcgplayerUrl={carta.tcgplayerUrl} updatedAt={carta.updatedAt}
              onRemove={() => removeCard(carta.id)} inCollection={true} />
          ))}
        </div>
      )}

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