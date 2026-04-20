import { useState } from "react"
import CardDetailModal from "./CardDetailModal"

interface Props {
  id: string
  name: string
  image: string | null
  price?: number
  prices?: Record<string, any>
  set?: string | null
  number?: string | null
  rarity?: string | null
  tcgplayerUrl?: string | null
  updatedAt?: string | null
  onAdd?: () => void
  onRemove?: () => void
  inCollection?: boolean
}

export default function PokemonCard({
  id, name, image, price = 0, prices = {},
  set, number, rarity, tcgplayerUrl, updatedAt,
  onAdd, onRemove, inCollection,
}: Props) {
  const [showDetail, setShowDetail] = useState(false)

  const carta = { id, name, image, price, prices, set: set ?? null, number: number ?? null, rarity: rarity ?? null, tcgplayerUrl: tcgplayerUrl ?? null, updatedAt: updatedAt ?? null }

  return (
    <>
      <div className="card" onClick={() => setShowDetail(true)} style={{ cursor: "pointer" }}>
        {image && <img src={image} alt={name} loading="lazy" />}

        <div className="card-content">
          <h3>{name}</h3>

          {rarity && (
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>{rarity}</p>
          )}

          <p className="price">
            {price > 0 ? `$${price.toFixed(2)}` : "Sem preço"}
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "auto" }}>
            {onAdd && !inCollection && (
              <button
                className="addButton"
                onClick={(e) => { e.stopPropagation(); onAdd() }}
              >
                Adicionar
              </button>
            )}
            {onRemove && (
              <button
                className="removeButton"
                onClick={(e) => { e.stopPropagation(); onRemove() }}
              >
                Remover
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetail(true) }}
              style={{
                marginTop: "auto",
                padding: "8px 0",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#6b7280",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Detalhes
            </button>
          </div>
        </div>
      </div>

      {showDetail && (
        <CardDetailModal
          carta={carta}
          onClose={() => setShowDetail(false)}
          onAdd={onAdd}
          onRemove={onRemove}
          inCollection={inCollection}
        />
      )}
    </>
  )
}