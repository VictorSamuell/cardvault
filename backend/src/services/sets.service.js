import { createCatalogCache } from './catalog-cache.js'
import { fetchCardCatalog } from './catalog-retry.js'
const cached = createCatalogCache()
import { fetchAllPages } from './catalog-pages.js'

export async function buscarSets() {
  const items = await cached('sets', () => fetchAllPages('sets', { orderBy: '-releaseDate' }, url => fetchCardCatalog(url)))

  return items.map(set => ({
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
  const items = await cached('set:' + setId, () => fetchAllPages('cards', { q: 'set.id:' + setId, orderBy: 'number' }, url => fetchCardCatalog(url)))

  return items

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
