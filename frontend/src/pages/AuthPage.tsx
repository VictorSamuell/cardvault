import { useState } from "react"
import useAuth from "../hooks/useAuth"

export default function AuthPage() {
  const { login, register } = useAuth()

  const [modo, setModo] = useState<"login" | "register">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setErro("")

    if (!email || !password) {
      setErro("Preencha todos os campos.")
      return
    }

    if (modo === "register") {
      if (!name) {
        setErro("Informe seu nome.")
        return
      }
      if (password.length < 6) {
        setErro("Senha deve ter ao menos 6 caracteres.")
        return
      }
      if (password !== confirmPassword) {
        setErro("As senhas não coincidem.")
        return
      }
    }

    try {
      setLoading(true)
      if (modo === "login") {
        await login(email, password)
      } else {
        await register(name, email, password)
      }
    } catch (err: any) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit()
  }

  function trocarModo() {
    setModo(modo === "login" ? "register" : "login")
    setErro("")
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: "20px",
    }}>
      <h1 style={{ marginBottom: "8px" }}>CardVault</h1>
      <p style={{ color: "#6b7280", marginBottom: "48px", fontSize: "0.9rem" }}>
        {modo === "login" ? "Entre na sua conta" : "Crie sua conta"}
      </p>

      <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {modo === "register" && (
          <input
            className="SearchInput"
            style={{ maxWidth: "100%" }}
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}

        <input
          className="SearchInput"
          style={{ maxWidth: "100%" }}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          className="SearchInput"
          style={{ maxWidth: "100%" }}
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* Confirmação só aparece no cadastro */}
        {modo === "register" && (
          <div style={{ position: "relative" }}>
            <input
              className="SearchInput"
              style={{
                maxWidth: "100%",
                borderBottomColor: confirmPassword
                  ? password === confirmPassword ? "#1D9E75" : "#ef4444"
                  : "#4b5563",
              }}
              placeholder="Confirmar senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {/* Ícone de feedback */}
            {confirmPassword && (
              <span style={{
                position: "absolute",
                right: "0",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                color: password === confirmPassword ? "#1D9E75" : "#ef4444",
              }}>
                {password === confirmPassword ? "✓" : "✗"}
              </span>
            )}
          </div>
        )}

        {erro && (
          <p style={{ color: "#ef4444", fontSize: "0.85rem", margin: 0 }}>
            {erro}
          </p>
        )}

        <button
          className="SearchButton"
          style={{ marginTop: "8px" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta"}
        </button>

        <button
          onClick={trocarModo}
          style={{
            background: "none", border: "none", color: "#6b7280",
            fontSize: "0.85rem", cursor: "pointer", marginTop: "8px",
          }}
        >
          {modo === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entre"}
        </button>

      </div>
    </div>
  )
}