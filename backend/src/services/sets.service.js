const API_URL = "https://api.pokemontcg.io/v2"

export async function buscarSets() {
  const response = await fetch(
    `${API_URL}/sets?orderBy=-releaseDate&pageSize=250`
  )

  if (!response.ok) throw new Error(`Erro na API: ${response.status}`)

  const data = await response.json()

  return data.data.map(set => ({
    id: set.id,
    name: set.name,
    series: set.series,
    logo: set.images?.logo ?? null,
    symbol: set.images?.symbol ?? null,
    total: set.total,
    releaseDate: set.releaseDate,
  }))
}

export async function buscarCartasPorSet(setId) {
  const response = await fetch(
    `${API_URL}/cards?q=set.id:${encodeURIComponent(setId)}&pageSize=250&orderBy=number`
  )

  if (!response.ok) throw new Error(`Erro na API: ${response.status}`)

  const data = await response.json()

  return data.data
    .filter(card => card.images?.large || card.images?.small)
    .map(card => {
      const prices = card?.tcgplayer?.prices ?? {}
      const ordem = ["holofoil", "normal", "reverseHolofoil", "1stEditionHolofoil"]
      let price = 0
      for (const tipo of ordem) {
        const p = prices[tipo]?.market ?? prices[tipo]?.mid ?? prices[tipo]?.low
        if (p && p > 0) { price = p; break }
      }

      const allPrices = {}
      for (const [tipo, dados] of Object.entries(prices)) {
        allPrices[tipo] = {
          low: dados.low ?? null,
          mid: dados.mid ?? null,
          high: dados.high ?? null,
          market: dados.market ?? null,
        }
      }

      return {
        id: card.id,
        name: card.name,
        image: card.images?.large ?? card.images?.small ?? null,
        set: card.set?.name ?? null,
        number: card.number ?? null,
        rarity: card.rarity ?? null,
        price,
        prices: allPrices,
        tcgplayerUrl: card.tcgplayer?.url ?? null,
        updatedAt: card.tcgplayer?.updatedAt ?? null,
      }
    })
}