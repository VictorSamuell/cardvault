import { createContext } from 'react'
import type { Carta } from './useCollection'

export interface CollectionState {
  collection: Carta[]
  loading: boolean
  error: string | null
  saving: boolean
  reload: () => Promise<void>
  addCard: (card: Carta) => Promise<void>
  removeCard: (id: string) => Promise<void>
  updateCard: (id: string, fields: Partial<Carta>) => Promise<boolean>
}
export const CollectionContext = createContext<CollectionState | null>(null)
