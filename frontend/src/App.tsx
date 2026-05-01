import { useState } from "react"
import { Search, Archive, Users, Settings, LogOut } from "lucide-react"
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
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) return null
  if (!user) return <AuthPage />

  const goToProfile = (username: string) => {
    setViewingUsername(username)
    setPage("profile")
  }

  const navigate = (p: Page) => {
    setPage(p)
    setMenuOpen(false)
  }

  return (
    <div>
      {/* ── NAVBAR ── */}
      <nav className="main-nav">
        {/* Logo */}
        <div className="nav-logo">
          <img src="/icon.svg" alt="CardVault" style={{ height: "28px" }} />
        </div>

        {/* Links — desktop */}
        <div className="nav-links">
          <button onClick={() => navigate("search")} className={page === "search" ? "nav-active" : ""}>
            Buscar
          </button>

          <button onClick={() => navigate("collection")} className={page === "collection" ? "nav-active" : ""}>
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

          <button onClick={() => navigate("profiles")} className={page === "profiles" || page === "profile" ? "nav-active" : ""}>
            Perfis
          </button>
        </div>

        {/* Ações — desktop */}
        <div className="nav-actions">
          <button
            onClick={() => navigate("settings")}
            style={{
              color: page === "settings" ? "#fff" : "#6b7280",
              fontSize: "0.85rem",
              transition: "color 0.2s",
            }}
          >
            {user.name}
          </button>
          <button onClick={logout} style={{ color: "#6b7280", fontSize: "0.85rem" }}>
            Sair
          </button>
        </div>

        {/* Hambúrguer — mobile */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* ── MENU MOBILE (gaveta) ── */}
      <div className={`nav-mobile-overlay${menuOpen ? " open" : ""}`}>
        <div className="nav-mobile-backdrop" onClick={() => setMenuOpen(false)} />
        <div className="nav-mobile-drawer">
          {/* Header da gaveta */}
          <div className="nav-mobile-header">
            <img src="/icon.svg" alt="CardVault" style={{ height: "24px" }} />
            <button className="nav-mobile-close" onClick={() => setMenuOpen(false)}>✕</button>
          </div>

          {/* Links principais */}
          <div className="nav-mobile-links">
            <button
              onClick={() => navigate("search")}
              className={page === "search" ? "nav-active" : ""}
            >
              <Search size={15} strokeWidth={1.5} />
              Buscar
            </button>

            <button
              onClick={() => navigate("collection")}
              className={page === "collection" ? "nav-active" : ""}
            >
              <Archive size={15} strokeWidth={1.5} />
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

            <button
              onClick={() => navigate("profiles")}
              className={page === "profiles" || page === "profile" ? "nav-active" : ""}
            >
              <Users size={15} strokeWidth={1.5} />
              Perfis
            </button>

            <button
              onClick={() => navigate("settings")}
              className={page === "settings" ? "nav-active" : ""}
            >
              <Settings size={15} strokeWidth={1.5} />
              Configurações
            </button>
          </div>

          {/* Rodapé com info do usuário + sair */}
          <div className="nav-mobile-footer">
            <div style={{ padding: "4px 12px 12px", fontSize: "0.8rem", color: "#6b7280" }}>
              Logado como <span style={{ color: "#fff" }}>{user.name}</span>
            </div>
            <button onClick={() => { logout(); setMenuOpen(false) }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LogOut size={14} strokeWidth={1.5} />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* ── PÁGINAS ── */}
      {page === "search" && <SearchPage />}
      {page === "collection" && <CollectionPage />}
      {page === "profiles" && <SearchProfilesPage onViewProfile={goToProfile} />}
      {page === "profile" && <ProfilePage username={viewingUsername} onBack={() => setPage("profiles")} />}
      {page === "settings" && <SettingsPage onBack={() => setPage("search")} />}
    </div>
  )
}

export default App