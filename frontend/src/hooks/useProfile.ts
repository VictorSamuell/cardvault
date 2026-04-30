import { useState } from "react"
import useAuth from "./useAuth"

const API = import.meta.env.VITE_API_URL || "https://cardvault-backend-plgs.onrender.com/api"

export interface ProfileUser {
  _id?: string
  name: string
  username: string
  bio: string
  avatarUrl: string
  isPublic: boolean
  createdAt?: string
}

export interface ProfileCard {
  id: string
  name: string
  imageUrl: string
  price?: number
  rarity?: string
  set?: string
}

export default function useProfile() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchProfile = async (username: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API}/profile/${username}`)
      if (!res.ok) throw new Error((await res.json()).error || "Perfil não encontrado")
      return await res.json() as { user: ProfileUser; collection: ProfileCard[] }
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const searchProfiles = async (q: string) => {
    if (q.length < 2) return []
    try {
      const res = await fetch(`${API}/profile/search?q=${encodeURIComponent(q)}`)
      return await res.json() as ProfileUser[]
    } catch {
      return []
    }
  }

  const updateProfile = async (data: Partial<ProfileUser>) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API}/profile/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Erro ao atualizar")
      return json as ProfileUser
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API}/profile/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Erro ao alterar senha")
      return true
    } catch (e: any) {
      setError(e.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { fetchProfile, searchProfiles, updateProfile, changePassword, loading, error }
}