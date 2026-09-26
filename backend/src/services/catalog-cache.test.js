import test from 'node:test'
import assert from 'node:assert/strict'
import { createCatalogCache } from './catalog-cache.js'
test('shares concurrent requests and caches successful reads', async()=>{const cache=createCatalogCache();let calls=0;const load=async()=>{calls++;return [1]};await Promise.all([cache('a',load),cache('a',load)]);await cache('a',load);assert.equal(calls,1)})
test('does not cache failures or cross set results', async()=>{const cache=createCatalogCache();await assert.rejects(cache('a',async()=>{throw Error()}));assert.deepEqual(await cache('a',async()=>[1]),[1]);assert.deepEqual(await cache('b',async()=>[2]),[2])})
