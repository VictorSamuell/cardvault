import { useState } from "react"
import useAuth from "./hooks/useAuth"
import useCollection from "./hooks/useCollection"
import SearchPage from "./pages/SearchPage.tsx"
import CollectionPage from "./pages/CollectionPage.tsx"
import AuthPage from "./pages/AuthPage.tsx"
import ProfilePage from "./pages/ProfilePage.tsx"
import SearchProfilesPage from "./pages/SearchProfilesPage.tsx"
import SettingsPage from "./pages/SettingsPage.tsx"
import "./App.css"

type Page = "search" | "collection" | "profiles" | "profile" | "settings"

function App() {
  const { user, loading, logout } = useAuth()
  const { collection } = useCollection()
  const [page, setPage] = useState<Page>("search")
  const [viewingUsername, setViewingUsername] = useState("")

  if (loading) return null
  if (!user) return <AuthPage />

  const goToProfile = (username: string) => {
    setViewingUsername(username)
    setPage("profile")
  }

  return (
    <div>
      <nav className="main-nav">
        <img src="/icon.svg" alt="CardVault" style={{ height: "28px" }} />

        <button onClick={() => setPage("search")} className={page === "search" ? "nav-active" : ""}>
          Buscar
        </button>

        <button onClick={() => setPage("collection")} className={page === "collection" ? "nav-active" : ""}>
          Coleção
          {collection.length > 0 && (
            <span style={{
              marginLeft: "8px", fontSize: "0.7rem",
              background: "#22262a", color: "#9ca3af",
              padding: "2px 7px", borderRadius: "99px",
            }}>
              {collection.length}
            </span>
          )}
        </button>

        <button onClick={() => setPage("profiles")} className={page === "profiles" || page === "profile" ? "nav-active" : ""}>
          Perfis
        </button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setPage("settings")}
            style={{
              background: "none", border: "none",
              color: page === "settings" ? "#fff" : "#6b7280",
              fontSize: "0.85rem", cursor: "pointer", padding: "8px 0",
              transition: "color 0.2s",
            }}
          >
            {user.name}
          </button>
          <button
            onClick={logout}
            style={{
              background: "none", border: "none",
              color: "#6b7280", fontSize: "0.85rem",
              cursor: "pointer", padding: "8px 0",
            }}
          >
            Sair
          </button>
        </div>
      </nav>

      {page === "search" && <SearchPage />}
      {page === "collection" && <CollectionPage />}
      {page === "profiles" && <SearchProfilesPage onViewProfile={goToProfile} />}
      {page === "profile" && <ProfilePage username={viewingUsername} onBack={() => setPage("profiles")} />}
      {page === "settings" && <SettingsPage onBack={() => setPage("search")} />}
    </div>
  )
}

export default App