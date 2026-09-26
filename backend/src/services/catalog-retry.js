// Retry only temporary upstream failures, with a bounded wait.
export async function fetchCardCatalog(url, request = fetch, pause = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await request(url, { signal: AbortSignal.timeout(12000) })
      if (response.ok) return response
      if (![500, 502, 503, 504].includes(response.status) || attempt === 2) throw new Error(`Erro na API: Status ${response.status}`)
      await response.body?.cancel()
    } catch (error) {
      if (attempt === 2 || (error.name !== 'TimeoutError' && !(error instanceof TypeError))) throw error
    }
    await pause(500 * (attempt + 1))
  }
}
