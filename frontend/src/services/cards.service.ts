const API_URL = import.meta.env.VITE_API_URL || 'https://cardvault-backend-plgs.onrender.com/api'

export async function fetchCatalog<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  try {
    const timeout = AbortSignal.timeout(60000)
    const response = await fetch(`${API_URL}${path}`, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout })
    if (!response.ok) throw new Error('Não foi possível carregar o catálogo. Tente novamente em instantes.')
    const data: unknown = await response.json()
    if (!Array.isArray(data)) throw new Error('O catálogo retornou uma resposta inválida. Tente novamente.')
    return data as T[]
  } catch (error) {
    if (signal?.aborted) throw error
    if (error instanceof Error && error.name === 'TimeoutError') throw new Error('A consulta demorou mais de 60 segundos. Tente novamente.')
    if (error instanceof TypeError) throw new Error('Não foi possível conectar ao catálogo. Confira sua conexão e tente novamente.')
    if (error instanceof SyntaxError) throw new Error('O catálogo retornou uma resposta inválida. Tente novamente.')
    throw error
  }
}

export function buscarCartas<T>(name: string, signal?: AbortSignal) {
  return fetchCatalog<T>(`/cartas?name=${encodeURIComponent(name)}`, signal)
}
