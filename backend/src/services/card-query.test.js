import test from 'node:test'
import assert from 'node:assert/strict'
import { montarQuery } from './card-query.js'
test('searches printed number against printed total, not secret-inclusive total', () => {
 assert.equal(montarQuery('136/135'), '!number:"136" set.printedTotal:135')
 assert.equal(montarQuery('charizard 136/135'), 'name:"charizard*" !number:"136" set.printedTotal:135')
 assert.equal(montarQuery(' TG01 / 030 '), '!number:"TG01" set.printedTotal:30')
})
test('preserves name search and escapes query operators', () => {
 assert.equal(montarQuery('M Mewtwo'), 'name:"M Mewtwo*"')
 assert.equal(montarQuery('name:*'), 'name:"name\\:\\**"')
 assert.throws(() => montarQuery(['charizard']))
})

test('standalone number searches all sets by exact card number', () => { assert.equal(montarQuery('135'), '!number:"135"'); assert.equal(montarQuery(' 135 '), '!number:"135"') })
