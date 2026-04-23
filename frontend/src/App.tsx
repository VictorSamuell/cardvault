import { useState } from "react"
import useAuth from "./hooks/useAuth"
import useCollection from "./hooks/useCollection"
import SearchPage from "./pages/SearchPage.tsx"
import CollectionPage from "./pages/CollectionPage.tsx"
import AuthPage from "./pages/AuthPage.tsx"
import "./App.css"

function App() {
  const { user, loading, logout } = useAuth()
  const { collection } = useCollection()
  const [page, setPage] = useState("search")

  if (loading) return null
  if (!user) return <AuthPage />

  return (
    <div>
      <nav className="main-nav">
        <button
          onClick={() => setPage("search")}
          className={page === "search" ? "nav-active" : ""}
        >
          Buscar
        </button>

        <button
          onClick={() => setPage("collection")}
          className={page === "collection" ? "nav-active" : ""}
        >
          Coleção
          {collection.length > 0 && (
            <span style={{
              marginLeft: "8px",
              fontSize: "0.7rem",
              background: "#22262a",
              color: "#9ca3af",
              padding: "2px 7px",
              borderRadius: "99px",
            }}>
              {collection.length}
            </span>
          )}
        </button>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            {user.name}
          </span>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: "0.85rem",
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            Sair
          </button>
        </div>
      </nav>

      {page === "search" && <SearchPage />}
      {page === "collection" && <CollectionPage />}
    </div>
  )
}

export default App