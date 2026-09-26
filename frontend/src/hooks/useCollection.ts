import { useContext } from 'react'
import { CollectionContext } from './CollectionContext'

export type Carta = {
  quantity?: number
  condition?: string
  language?: string
  purchasePrice?: number | null
  status?: 'owned' | 'wishlist'
  notes?: string
  id: string
  name: string
  image: string | null
  price: number
  prices: Record<string, {
    low: number | null
    mid: number | null
    high: number | null
    market: number | null
  }>
  set: string | null
  number: string | null
  rarity: string | null
  tcgplayerUrl: string | null
  updatedAt: string | null
}


export default function useCollection() {
 const value = useContext(CollectionContext)
 if (!value) throw new Error('CollectionProvider ausente')
 return value
}
