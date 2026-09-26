import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchAllPages } from './catalog-pages.js'
test('fetches beyond 250 cards and preserves cards without images', async () => {
  const urls = []
  const result = await fetchAllPages('cards', { q: 'set.id:test' }, async url => {
    urls.push(url)
    return { ok: true, json: async () => ({ data: urls.length === 1 ? Array.from({length:250}, (_,id) => ({id})) : [{id:250}], totalCount:251 }) }
  })
  assert.equal(result.length, 251)
  assert.equal(new URL(urls[1]).searchParams.get('page'), '2')
  assert.equal(new URL(urls[1]).searchParams.get('q'), 'set.id:test')
})
test('does not return a partial catalogue on failed second page', async () => {
  let calls = 0
  await assert.rejects(fetchAllPages('cards', {}, async () => ++calls === 1 ? {ok:true,json:async()=>({data:Array(250).fill({}),totalCount:251})} : {ok:false,status:503}))
})
