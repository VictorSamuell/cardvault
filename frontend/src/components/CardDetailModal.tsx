import { useEffect, useRef } from "react"

interface PriceDetail {
  low: number | null
  mid: number | null
  high: number | null
  market: number | null
}

interface CardDetail {
  id: string
  name: string
  image: string | null
  set: string | null
  number: string | null
  rarity: string | null
  price: number
  prices: Record<string, PriceDetail>
  tcgplayerUrl: string | null
  updatedAt: string | null
}

interface Props {
  carta: CardDetail
  onClose: () => void
  onAdd?: () => void
  onRemove?: () => void
  inCollection?: boolean
}

const PRICE_LABELS: Record<string, string> = {
  holofoil: "Holofoil",
  normal: "Normal",
  reverseHolofoil: "Reverse Holo",
  "1stEditionHolofoil": "1st Ed. Holo",
  "1stEditionNormal": "1st Ed. Normal",
}

function MiniChart({ price }: { price: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || price === 0) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Gera histórico simulado de 12 semanas com variação realista
    const points: number[] = []
    let current = price * 0.75
    for (let i = 0; i < 12; i++) {
      const change = (Math.random() - 0.45) * price * 0.08
      current = Math.max(price * 0.5, current + change)
      points.push(current)
    }
    points.push(price)

    const W = canvas.width
    const H = canvas.height
    const pad = { top: 8, bottom: 8, left: 4, right: 4 }
    const minP = Math.min(...points)
    const maxP = Math.max(...points)
    const range = maxP - minP || 1

    const toX = (i: number) => pad.left + (i / (points.length - 1)) * (W - pad.left - pad.right)
    const toY = (v: number) => pad.top + (1 - (v - minP) / range) * (H - pad.top - pad.bottom)

    ctx.clearRect(0, 0, W, H)

    // Área preenchida
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(points[0]))
    points.forEach((p, i) => ctx.lineTo(toX(i), toY(p)))
    ctx.lineTo(toX(points.length - 1), H)
    ctx.lineTo(toX(0), H)
    ctx.closePath()
    ctx.fillStyle = "rgba(29, 158, 117, 0.08)"
    ctx.fill()

    // Linha
    ctx.beginPath()
    ctx.moveTo(toX(0), toY(points[0]))
    points.forEach((p, i) => ctx.lineTo(toX(i), toY(p)))
    ctx.strokeStyle = "#1D9E75"
    ctx.lineWidth = 1.5
    ctx.lineJoin = "round"
    ctx.stroke()

    // Ponto final (preço atual)
    ctx.beginPath()
    ctx.arc(toX(points.length - 1), toY(price), 3, 0, Math.PI * 2)
    ctx.fillStyle = "#1D9E75"
    ctx.fill()
  }, [price])

  if (price === 0) return null

  return (
    <div style={{ marginTop: "20px" }}>
      <p style={{ fontSize: "11px", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
        Tendência de preço (simulada)
      </p>
      <div style={{ background: "#181b1f", borderRadius: "8px", padding: "12px" }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={72}
          style={{ width: "100%", height: "72px", display: "block" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
          {["12sem", "10sem", "8sem", "6sem", "4sem", "2sem", "hoje"].map((l) => (
            <span key={l} style={{ fontSize: "10px", color: "#4b5563" }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CardDetailModal({ carta, onClose, onAdd, onRemove, inCollection }: Props) {
  // Fechar com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const priceEntries = Object.entries(carta.prices ?? {}).filter(
    ([, v]) => v.market !== null || v.mid !== null
  )

  const bestPrice = carta.price > 0
    ? `$${carta.price.toFixed(2)}`
    : "Sem preço"

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#181b1f",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* Fechar */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none", color: "#6b7280",
            fontSize: "20px", cursor: "pointer", lineHeight: 1,
            zIndex: 10,
          }}
        >
          ×
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0 }}>
          {/* Imagem */}
          <div style={{
            background: "#22262a",
            borderRadius: "12px 0 0 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
            minHeight: "300px",
          }}>
            {carta.image ? (
              <img
                src={carta.image}
                alt={carta.name}
                style={{ width: "100%", borderRadius: "8px" }}
              />
            ) : (
              <div style={{ width: "100%", aspectRatio: "2/3", background: "#2d3238", borderRadius: "8px" }} />
            )}
          </div>

          {/* Info */}
          <div style={{ padding: "28px 28px 28px 24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 500, color: "#ffffff", marginBottom: "6px" }}>
              {carta.name}
            </h2>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
              {carta.set && (
                <span style={{ fontSize: "12px", color: "#9ca3af", background: "#22262a", padding: "3px 10px", borderRadius: "99px" }}>
                  {carta.set}
                </span>
              )}
              {carta.number && (
                <span style={{ fontSize: "12px", color: "#9ca3af", background: "#22262a", padding: "3px 10px", borderRadius: "99px" }}>
                  #{carta.number}
                </span>
              )}
              {carta.rarity && (
                <span style={{ fontSize: "12px", color: "#EF9F27", background: "rgba(239,159,39,0.1)", padding: "3px 10px", borderRadius: "99px" }}>
                  {carta.rarity}
                </span>
              )}
            </div>

            {/* Preço principal */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
                Melhor preço
              </p>
              <p style={{ fontSize: "32px", fontWeight: 500, color: carta.price > 0 ? "#1D9E75" : "#6b7280" }}>
                {bestPrice}
              </p>
            </div>

            {/* Todos os preços */}
            {priceEntries.length > 0 && (
              <div>
                <p style={{ fontSize: "11px", fontWeight: 500, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  Preços por tipo
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {priceEntries.map(([tipo, dados]) => {
                    const valor = dados.market ?? dados.mid
                    return (
                      <div key={tipo} style={{ background: "#22262a", borderRadius: "8px", padding: "10px 14px" }}>
                        <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>
                          {PRICE_LABELS[tipo] ?? tipo}
                        </p>
                        <p style={{ fontSize: "16px", fontWeight: 500, color: "#ffffff" }}>
                          ${valor?.toFixed(2)}
                        </p>
                        {dados.low && dados.high && (
                          <p style={{ fontSize: "11px", color: "#4b5563", marginTop: "2px" }}>
                            ${dados.low.toFixed(2)} – ${dados.high.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Gráfico */}
            <MiniChart price={carta.price} />

            {carta.updatedAt && (
              <p style={{ fontSize: "11px", color: "#4b5563", marginTop: "12px" }}>
                Preços atualizados em {new Date(carta.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        {/* Rodapé */}
        {}
        
        <div style={{
          borderTop: "1px solid #22262a",
          padding: "16px 28px",
          display: "flex", gap: "12px", alignItems: "center",
        }}>
          {inCollection ? (
            <button
              onClick={onRemove}
              className="removeButton"
              style={{
                padding: "8px 20px",
                borderRadius: "99px",
                border: "1px solid #374151",
                color: "#9ca3af",
                fontSize: "0.8rem",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 600,
              }}
            >
              Remover da coleção
            </button>
          ) : (
            <button
              onClick={onAdd}
              className="addButton"
              style={{
                padding: "8px 20px",
                borderRadius: "99px",
                border: "1px solid #374151",
                color: "#9ca3af",
                fontSize: "0.8rem",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 600,
              }}
            >
              Adicionar à coleção
            </button>
          )}

          {carta.tcgplayerUrl && (
            <a
              href={carta.tcgplayerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 20px",
                borderRadius: "99px",
                border: "1px solid #374151",
                color: "#9ca3af",
                fontSize: "0.8rem",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 600,
              }}
            >
              Ver no TCGPlayer
            </a>
          )}

          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#374151" }}>
            {carta.id}
          </span>
        </div>
      </div>
    </div>
  )
}
