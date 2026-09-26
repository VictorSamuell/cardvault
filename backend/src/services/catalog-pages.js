const API_URL = 'https://api.pokemontcg.io/v2'

export async function fetchAllPages(resource, query, request = fetch) {
  const cards = []
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ ...query, pageSize: '250', page: String(page) })
    const response = await request(`${API_URL}/${resource}?${params}`, { signal: AbortSignal.timeout(60000) })
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`)
    const data = await response.json()
    if (!Array.isArray(data.data)) throw new Error('Catálogo inválido')
    cards.push(...data.data)
    if (cards.length >= data.totalCount || data.data.length < 250) return cards
    if (page >= 100) throw new Error('Catálogo excede o limite de páginas')
  }
}
