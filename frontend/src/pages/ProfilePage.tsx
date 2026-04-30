import { useEffect, useState } from "react"
import useProfile, { type ProfileUser, type ProfileCard } from "../hooks/useProfile"
import useAuth from "../hooks/useAuth"
import PokemonCard from "../components/PokemonCard"
import useCollection, { type Carta } from "../hooks/useCollection"

interface Props {
  username: string
  onBack: () => void
}

export default function ProfilePage({ username, onBack }: Props) {
  const { fetchProfile, loading, error } = useProfile()
  const { user: me } = useAuth()
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null)
  const [collection, setCollection] = useState<ProfileCard[]>([])

  const { addCard, collection: myCollection } = useCollection()
  const myCollectionIds = new Set(myCollection.map(c => c.id))

  useEffect(() => {
    fetchProfile(username).then((data) => {
      if (data) {
        setProfileUser(data.user)
        setCollection(data.collection)
      }
    })
  }, [username])

  const isOwner = me && profileUser && (me.username === profileUser.username || me.name === profileUser.name)

  const totalValue = collection.reduce((sum, c) => sum + (c.price || 0), 0)
  const initials = profileUser?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#6b7280", fontSize: "0.85rem", letterSpacing: "1px", textTransform: "uppercase" }}>
      Carregando perfil...
    </div>
  )

  if (error) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>{error}</p>
      <button onClick={onBack} style={backBtnStyle}>← Voltar</button>
    </div>
  )

  if (!profileUser) return null

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 80px" }}>
      <button onClick={onBack} style={backBtnStyle}>← Voltar</button>

      {/* Header do perfil */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "32px", marginBottom: "60px", flexWrap: "wrap" }}>
        {/* Avatar */}
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: profileUser.avatarUrl ? "transparent" : "#22262a",
          border: "1px solid #22262a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem", fontWeight: 500, color: "#9ca3af",
          flexShrink: 0, overflow: "hidden",
        }}>
          {profileUser.avatarUrl
            ? <img src={profileUser.avatarUrl} alt={profileUser.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials}
        </div>

        {/* Info com flex-basis para quebrar linha no celular se necessário */}
        <div style={{ flex: "1 1 250px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 500 }}>{profileUser.name}</h2>
          <p style={{ margin: "0 0 12px", color: "#6b7280", fontSize: "0.8rem", letterSpacing: "1px" }}>
            @{profileUser.username}
          </p>
          {profileUser.bio && (
            <p style={{ margin: "0 0 16px", color: "#9ca3af", fontSize: "0.9rem", lineHeight: 1.6, maxWidth: "480px" }}>
              {profileUser.bio}
            </p>
          )}

          {/* Stats */}
          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 500, color: "#fff" }}>{collection.length}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>cartas</div>
            </div>
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: 500, color: "#fff" }}>
                ${totalValue.toFixed(2)}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "1px" }}>valor total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coleção */}
      {collection.length > 0 ? (
        <>
          <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "2px", color: "#6b7280", marginBottom: "24px", fontWeight: 500 }}>
            Coleção
          </h3>
          <div className="grid" style={{ padding: 0 }}>
            {collection.map((card) => (
              <PokemonCard
                key={card.id}
                id={card.id}
                name={card.name}
                image={card.imageUrl}
                price={card.price || 0}
                prices={{}}
                set={card.set || null}
                number={null}
                rarity={card.rarity || null}
                tcgplayerUrl={null}
                updatedAt={null}
                onAdd={!isOwner ? () => {
                  // Converte de ProfileCard para o tipo Carta esperado pela coleção
                  const cardToAdd: Carta = {
                    id: card.id,
                    name: card.name,
                    image: card.imageUrl,
                    price: card.price || 0,
                    set: card.set || null,
                    rarity: card.rarity || null,
                    prices: {}, number: null, tcgplayerUrl: null, updatedAt: null,
                  }
                  addCard(cardToAdd)
                } : undefined}
                inCollection={myCollectionIds.has(card.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <p style={{ color: "#6b7280", fontSize: "0.85rem", textAlign: "center", padding: "40px 0" }}>
          {isOwner ? "Sua coleção está vazia." : "Coleção privada ou vazia."}
        </p>
      )}
    </div>
  )
}

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#6b7280",
  fontSize: "0.8rem",
  letterSpacing: "1px",
  textTransform: "uppercase",
  cursor: "pointer",
  padding: "0 0 40px",
  display: "block",
  transition: "color 0.2s",
}