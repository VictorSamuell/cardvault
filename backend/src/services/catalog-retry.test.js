import test from 'node:test'
import assert from 'node:assert/strict'
import { fetchCardCatalog } from './catalog-retry.js'
test('recovers from 500 and stops at success', async()=>{let n=0; const r=await fetchCardCatalog('test',async()=>new Response('',{status:++n===1?500:200}),async()=>{});assert.equal(r.status,200);assert.equal(n,2)})
test('bounds retries and does not retry invalid requests', async()=>{for(const status of [500,400]){let n=0;await assert.rejects(fetchCardCatalog('test',async()=>{n++;return new Response('',{status})},async()=>{}));assert.equal(n,status===500?3:1)}})
