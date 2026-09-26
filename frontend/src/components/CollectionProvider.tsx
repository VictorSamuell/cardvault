import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { CollectionContext } from '../hooks/CollectionContext'
import type { Carta } from '../hooks/useCollection'

const API = import.meta.env.VITE_API_URL || 'https://cardvault-backend-plgs.onrender.com/api'

export default function CollectionProvider({ children }: { children: ReactNode }) {
  const [collection, setCollection] = useState<Carta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const busy = useRef(false)
  const version = useRef(0)

  const request = useCallback(async (path = '', method = 'GET', card?: Partial<Carta>) => {
    const token = localStorage.getItem('cardvault_token')
    if (!token) throw new Error('Entre na sua conta para acessar a coleção.')
    const response = await fetch(`${API}/collection${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: card ? JSON.stringify(card) : undefined,
      signal: AbortSignal.timeout(60000),
    })
    if (response.status === 401) throw new Error('Sua sessão expirou. Saia e entre novamente.')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir. Tente novamente.')
    if (!Array.isArray(data.cards)) throw new Error('O servidor retornou uma coleção inválida.')
    return data.cards as Carta[]
  }, [])

  const reload = useCallback(async () => {
    const current = ++version.current
    setLoading(true)
    setError(null)
    try {
      const cards = await request()
      if (current === version.current) setCollection(cards)
    } catch (err) {
      if (current === version.current) setError(err instanceof Error ? err.message : 'Falha ao carregar a coleção.')
    } finally {
      if (current === version.current) setLoading(false)
    }
  }, [request])

  useEffect(() => { void reload() }, [reload])

  async function mutate(path: string, method: string, card?: Partial<Carta>) {
    if (busy.current) return false
    busy.current = true
    version.current++
    setSaving(true)
    setError(null)
    try { setCollection(await request(path, method, card)); return true }
    catch (err) { setError(err instanceof Error ? err.message : 'Falha ao salvar. Tente novamente.'); return false }
    finally { setSaving(false); setLoading(false); busy.current = false }
  }

  return <CollectionContext.Provider value={{ collection, loading, error, saving, reload,
    addCard: async card => { await mutate('', 'POST', card) },
    removeCard: async id => { await mutate(`/${encodeURIComponent(id)}`, 'DELETE') },
    updateCard: (id, fields) => mutate(`/${encodeURIComponent(id)}`, 'PATCH', fields),
  }}>{children}</CollectionContext.Provider>
}
