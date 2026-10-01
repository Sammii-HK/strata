/// <reference types="node" />
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import {
  COMPLETE_ENTITLEMENT,
  completePrice,
  isLegacyBuyer,
  packIdFromProductId,
  productIdFor,
  resolveOwnedMaps,
  tierPrice,
} from './entitlements.ts'

const PAID = ['history', 'evolution', 'mythologies', 'balladry', 'bestiary', 'blazon', 'geode'] as const

describe('isLegacyBuyer', () => {
  test('build numbers up to 3 are the paid era', () => {
    assert.equal(isLegacyBuyer('1'), true)
    assert.equal(isLegacyBuyer('2'), true)
    assert.equal(isLegacyBuyer('3'), true)
  })
  test('build 4 onwards is freemium', () => {
    assert.equal(isLegacyBuyer('4'), false)
    assert.equal(isLegacyBuyer('10'), false)
    assert.equal(isLegacyBuyer('40'), false)
  })
  test('compares numerically, not as strings', () => {
    assert.equal(isLegacyBuyer('10'), false) // "10" < "3" as strings, but not as builds
    assert.equal(isLegacyBuyer('03'), true)
  })
  test('missing or unparseable values are not legacy', () => {
    assert.equal(isLegacyBuyer(undefined), false)
    assert.equal(isLegacyBuyer(null), false)
    assert.equal(isLegacyBuyer(''), false)
    assert.equal(isLegacyBuyer('abc'), false)
  })
  test('tolerates dotted build strings by their leading integer', () => {
    assert.equal(isLegacyBuyer('3.0'), true)
    assert.equal(isLegacyBuyer('4.1'), false)
  })
})

describe('resolveOwnedMaps', () => {
  test('nothing active, not legacy: nothing owned', () => {
    assert.deepEqual(resolveOwnedMaps(PAID, new Set(), false), new Set())
  })
  test('per-pack entitlements unlock exactly those packs', () => {
    const owned = resolveOwnedMaps(PAID, new Set(['evolution', 'geode']), false)
    assert.deepEqual(owned, new Set(['evolution', 'geode']))
  })
  test('unknown entitlement ids are ignored', () => {
    const owned = resolveOwnedMaps(PAID, new Set(['complete', 'oceans', 'cosmos']), false)
    assert.deepEqual(owned, new Set())
  })
  test('strata-complete unlocks every paid map', () => {
    const owned = resolveOwnedMaps(PAID, new Set([COMPLETE_ENTITLEMENT]), false)
    assert.deepEqual(owned, new Set(PAID))
  })
  test('legacy buyers get every paid map: they paid the Complete price', () => {
    assert.deepEqual(resolveOwnedMaps(PAID, new Set(), true), new Set(PAID))
  })
  test('legacy plus a pack purchase is still everything', () => {
    const owned = resolveOwnedMaps(PAID, new Set(['blazon']), true)
    assert.deepEqual(owned, new Set(PAID))
  })
  test('legacy grant covers whatever the paid catalogue is, not just History', () => {
    assert.deepEqual(resolveOwnedMaps(['evolution'], new Set(), true), new Set(['evolution']))
  })
})

describe('prices', () => {
  test('tier fallback prices', () => {
    assert.equal(tierPrice('small'), '£1.99')
    assert.equal(tierPrice('big'), '£2.99')
  })
  test('Complete is £9.99 for up to seven paid maps', () => {
    assert.equal(completePrice(0), '£9.99')
    assert.equal(completePrice(3), '£9.99')
    assert.equal(completePrice(7), '£9.99')
  })
  test('Complete rises £1 per paid map beyond seven', () => {
    assert.equal(completePrice(8), '£10.99')
    assert.equal(completePrice(10), '£12.99')
    assert.equal(completePrice(17), '£19.99')
  })
  test('Complete caps at £19.99', () => {
    assert.equal(completePrice(18), '£19.99')
    assert.equal(completePrice(40), '£19.99')
  })
  test('every Complete price ends in .99', () => {
    for (let n = 0; n <= 30; n++) assert.match(completePrice(n), /^£\d+\.99$/)
  })
})

describe('product ids', () => {
  test('round-trips pack ids through the store prefix', () => {
    for (const id of PAID) assert.equal(packIdFromProductId(productIdFor(id)), id)
    assert.equal(productIdFor('history'), 'app.lunary.strata.history')
    assert.equal(packIdFromProductId('app.lunary.strata.complete'), 'complete')
  })
  test('rejects ids from other apps', () => {
    assert.equal(packIdFromProductId('app.lunary.strati.cosmos.full'), null)
    assert.equal(packIdFromProductId('app.lunary.strata.'), null)
  })
})
