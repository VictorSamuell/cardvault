import PokemonCard from "../components/PokemonCard"
import useCollection from "../hooks/useCollection"

export default function CollectionPage() {
  const { collection, removeCard } = useCollection()

  const cartasOrdenadas = [...collection].sort(
    (a, b) => (b.price || 0) - (a.price || 0)
  )

  const total = collection.reduce((sum, c) => sum + (c.price || 0), 0)
  const cartaMaisCara = cartasOrdenadas.find(c => c.price > 0)
  const semPreco = collection.filter(c => !c.price || c.price === 0).length

  return (
    <div>
      <h1>Minha Coleção</h1>

      {collection.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "80px", color: "#6b7280" }}>
          <p style={{ fontSize: "1rem" }}>Sua coleção está vazia.</p>
          <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>Busque cartas e adicione aqui.</p>
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            maxWidth: "1200px",
            margin: "0 auto 60px",
            padding: "0 20px",
          }}>
            <div style={statCard}>
              <span style={statLabel}>Total de cartas</span>
              <span style={statValue}>{collection.length}</span>
            </div>
            <div style={statCard}>
              <span style={statLabel}>Valor total</span>
              <span style={{ ...statValue, color: "#1D9E75" }}>${total.toFixed(2)}</span>
            </div>
            <div style={statCard}>
              <span style={statLabel}>Carta mais valiosa</span>
              <span style={{ ...statValue, fontSize: "1rem" }}>
                {cartaMaisCara ? `$${cartaMaisCara.price.toFixed(2)}` : "—"}
              </span>
              {cartaMaisCara && (
                <span style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px" }}>
                  {cartaMaisCara.name}
                </span>
              )}
            </div>
            <div style={statCard}>
              <span style={statLabel}>Sem preço</span>
              <span style={{ ...statValue, color: semPreco > 0 ? "#9ca3af" : "#1D9E75" }}>
                {semPreco}
              </span>
            </div>
          </div>

          <div className="grid">
            {cartasOrdenadas.map((carta) => (
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
                onRemove={() => removeCard(carta.id)}
                inCollection={true}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const statCard: React.CSSProperties = {
  background: "#181b1f",
  borderRadius: "10px",
  padding: "20px 24px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  textAlign: "left",
}

const statLabel: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  fontWeight: 500,
}

const statValue: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 500,
  color: "#ffffff",
}