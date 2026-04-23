import { useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
}

const API_URL = "http://localhost:3000/api/auth"

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Ao abrir o app, verifica se já tem token salvo
  useEffect(() => {
    const token = localStorage.getItem("cardvault_token")
    const savedUser = localStorage.getItem("cardvault_user")

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  async function register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error)

    localStorage.setItem("cardvault_token", data.token)
    localStorage.setItem("cardvault_user", JSON.stringify(data.user))
    setUser(data.user)

    window.location.reload()

  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error)

    localStorage.setItem("cardvault_token", data.token)
    localStorage.setItem("cardvault_user", JSON.stringify(data.user))
    setUser(data.user)

    window.location.reload()

  }

  function logout() {
    localStorage.removeItem("cardvault_token")
    localStorage.removeItem("cardvault_user")
    setUser(null)
  }

  // Retorna o token para usar em requisições protegidas
  function getToken() {
    return localStorage.getItem("cardvault_token")
  }

  return { user, loading, login, register, logout, getToken }
}