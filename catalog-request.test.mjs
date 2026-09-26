import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from './frontend/node_modules/typescript/lib/typescript.js'
const source = fs.readFileSync(new URL('./frontend/src/services/cards.service.ts', import.meta.url), 'utf8').replace('import.meta.env.VITE_API_URL', "'http://example.invalid/api'")
const compiled = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText
const { fetchCatalog } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'))
test('catalogue distinguishes empty results, HTTP failures, invalid JSON and timeout', async () => {
 const original = globalThis.fetch
 try {
  globalThis.fetch = async () => new Response('[]')
  assert.deepEqual(await fetchCatalog('/sets'), [])
  globalThis.fetch = async () => new Response('{}', {status:502})
  await assert.rejects(fetchCatalog('/sets'), /Não foi possível carregar/)
  globalThis.fetch = async () => new Response('{}')
  await assert.rejects(fetchCatalog('/sets'), /resposta inválida/)
  globalThis.fetch = async () => { throw new DOMException('timeout', 'TimeoutError') }
  await assert.rejects(fetchCatalog('/sets'), /60 segundos/)
  const controller = new AbortController()
  controller.abort()
  globalThis.fetch = async (_, options) => { options.signal.throwIfAborted() }
  await assert.rejects(fetchCatalog('/sets', controller.signal), {name:'AbortError'})
 } finally { globalThis.fetch = original }
})
