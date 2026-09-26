import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateMetadata } from './collection-metadata.js'

test('aceita edição parcial sem apagar campos não enviados', () => {
  assert.deepEqual(validateMetadata({ quantity: 3 }), { quantity: 3 })
  assert.deepEqual(validateMetadata({ purchasePrice: null, status: 'wishlist' }), { purchasePrice: null, status: 'wishlist' })
})
test('rejeita valores inválidos e alteração de identidade', () => {
  for (const body of [{ quantity: 0 }, { quantity: 1.5 }, { quantity: '2' }, { purchasePrice: -1 }, { purchasePrice: Infinity }, { status: 'admin' }, { userId: 'another-user' }, { id: 'other-card' }, { notes: 'a'.repeat(501) }, {}, null]) {
    assert.throws(() => validateMetadata(body))
  }
})
test('aceita coleção completa com valor zero e quantidade limite', () => {
  const body = { quantity: 9999, purchasePrice: 0, condition: 'Near Mint', language: 'Português', status: 'owned', notes: 'Presente' }
  assert.deepEqual(validateMetadata(body), body)
})
