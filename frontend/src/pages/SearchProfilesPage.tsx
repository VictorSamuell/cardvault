import { useState, useEffect, useRef } from "react"
import useProfile, { type ProfileUser } from "../hooks/useProfile"

interface Props {
  onViewProfile: (username: string) => void
}

export default function SearchProfilesPage({ onViewProfile }: Props) {
  const { searchProfiles } = useProfile()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<ProfileUser[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setResults([]); return }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const data = await searchProfiles(query)
      setResults(Array.isArray(data) ? data : [])
      setSearching(false)
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px 80px", textAlign: "center" }}>
      <h2 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "2px", color: "#6b7280", marginBottom: "32px", fontWeight: 500 }}>
        Buscar colecionadores
      </h2>

      <input
        className="SearchInput"
        type="text"
        placeholder="Nome ou @username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        style={{ display: "block", margin: "0 auto 40px", width: "100%" }}
      />

      {searching && (
        <p style={{ color: "#6b7280", fontSize: "0.8rem", letterSpacing: "1px", textTransform: "uppercase" }}>
          Buscando...
        </p>
      )}

      {!searching && query.length >= 2 && results.length === 0 && (
        <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
          Nenhum colecionador encontrado.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
        {results.map((u) => (
          <button
            key={u.username}
            onClick={() => onViewProfile(u.username)}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              background: "#181b1f", border: "1px solid #22262a", borderRadius: "12px",
              padding: "16px 20px", cursor: "pointer", textAlign: "left", width: "100%",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1f2328"; e.currentTarget.style.borderColor = "#374151" }}
            onMouseLeave={e => { e.currentTarget.style.background = "#181b1f"; e.currentTarget.style.borderColor = "#22262a" }}
          >
            {/* Avatar */}
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: u.avatarUrl ? "transparent" : "#22262a",
              border: "1px solid #22262a",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.8rem", fontWeight: 500, color: "#9ca3af",
              flexShrink: 0, overflow: "hidden",
            }}>
              {u.avatarUrl
                ? <img src={u.avatarUrl} alt={u.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : getInitials(u.name)}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 500, marginBottom: "2px" }}>{u.name}</div>
              <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>@{u.username}</div>
              {u.bio && <div style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "6px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{u.bio}</div>}
            </div>

            <span style={{ color: "#4b5563", fontSize: "1.2rem", fontWeight: 300 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  )
}