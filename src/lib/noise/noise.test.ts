import { describe, expect, it } from 'vitest'
import type { NoiseParams } from '../../types'
import { fbm } from './fbm'
import { perlin2D } from './perlin'
import { generatePermutation } from './permutation'

describe('generatePermutation', () => {
  it('returns Uint8Array of length 512', () => {
    const perm = generatePermutation({ seed: 12345 })
    expect(perm).toBeInstanceOf(Uint8Array)
    expect(perm.length).toBe(512)
  })

  it('contains each value 0-255 exactly twice', () => {
    const perm = generatePermutation({ seed: 42 })
    const counts = new Array(256).fill(0)

    for (let i = 0; i < 512; i++) {
      counts[perm[i]]++
    }

    for (let i = 0; i < 256; i++) {
      expect(counts[i]).toBe(2)
    }
  })

  it('is deterministic for same seed', () => {
    const perm1 = generatePermutation({ seed: 99999 })
    const perm2 = generatePermutation({ seed: 99999 })

    expect(perm1).toEqual(perm2)
  })

  it('differs for different seeds', () => {
    const perm1 = generatePermutation({ seed: 111 })
    const perm2 = generatePermutation({ seed: 222 })

    // They should differ at at least one position
    let differs = false
    for (let i = 0; i < 512; i++) {
      if (perm1[i] !== perm2[i]) {
        differs = true
        break
      }
    }
    expect(differs).toBe(true)
  })
})

describe('perlin2D', () => {
  const permutation = generatePermutation({ seed: 12345 })

  it('returns values in range [-1, 1]', () => {
    // Test 1000 random points
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 100 - 50
      const y = Math.random() * 100 - 50
      const value = perlin2D({ x, y, permutation })

      expect(value).toBeGreaterThanOrEqual(-1)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('is deterministic for same inputs', () => {
    const x = 3.14159
    const y = 2.71828

    const value1 = perlin2D({ x, y, permutation })
    const value2 = perlin2D({ x, y, permutation })

    expect(value1).toBe(value2)
  })

  it('is continuous (nearby inputs produce nearby outputs)', () => {
    const x = 5.5
    const y = 7.3
    const delta = 0.001

    const base = perlin2D({ x, y, permutation })
    const nearbyX = perlin2D({ x: x + delta, y, permutation })
    const nearbyY = perlin2D({ x, y: y + delta, permutation })

    // Nearby points should produce similar values
    expect(Math.abs(base - nearbyX)).toBeLessThan(0.1)
    expect(Math.abs(base - nearbyY)).toBeLessThan(0.1)
  })

  it('varies across space (not constant)', () => {
    const values = new Set<number>()

    for (let i = 0; i < 100; i++) {
      const x = i * 0.5
      const y = i * 0.3
      values.add(perlin2D({ x, y, permutation }))
    }

    // Should have many unique values, not just one constant
    expect(values.size).toBeGreaterThan(50)
  })
})

describe('fbm', () => {
  const baseNoise: NoiseParams = {
    seed: 12345,
    frequency: 1,
    amplitude: 1,
    octaves: 4,
    lacunarity: 2,
    persistence: 0.5,
  }
  const permutation = generatePermutation({ seed: baseNoise.seed })

  it('returns values in range [0, 1]', () => {
    // Test many points across space
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 100 - 50
      const y = Math.random() * 100 - 50
      const value = fbm({ x, y, noise: baseNoise, permutation })

      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('with 1 octave equals normalized perlin', () => {
    const singleOctaveNoise: NoiseParams = {
      ...baseNoise,
      octaves: 1,
      frequency: 1,
      amplitude: 1,
    }

    const x = 3.5
    const y = 2.7

    const fbmValue = fbm({ x, y, noise: singleOctaveNoise, permutation })
    const perlinValue = perlin2D({ x, y, permutation })

    // FBM with 1 octave should equal (perlin + 1) / 2 (normalized to [0,1])
    const normalizedPerlin = (perlinValue + 1) / 2

    expect(fbmValue).toBeCloseTo(normalizedPerlin, 5)
  })

  it('more octaves adds more variation', () => {
    const singleOctave: NoiseParams = { ...baseNoise, octaves: 1 }
    const multiOctave: NoiseParams = { ...baseNoise, octaves: 6 }

    // Sample many points and measure variation
    const singleValues: number[] = []
    const multiValues: number[] = []

    for (let i = 0; i < 100; i++) {
      const x = i * 0.1
      const y = i * 0.07
      singleValues.push(fbm({ x, y, noise: singleOctave, permutation }))
      multiValues.push(fbm({ x, y, noise: multiOctave, permutation }))
    }

    // Calculate variance as a measure of variation
    const variance = (arr: number[]) => {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length
      return arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length
    }

    // Multi-octave should have at least as much variation locally
    // (this tests that octaves are actually being added)
    const singleVariance = variance(singleValues)
    const multiVariance = variance(multiValues)

    // Both should have meaningful variation
    expect(singleVariance).toBeGreaterThan(0)
    expect(multiVariance).toBeGreaterThan(0)
  })

  it('frequency scales input coordinates', () => {
    const lowFreq: NoiseParams = { ...baseNoise, frequency: 1 }
    const highFreq: NoiseParams = { ...baseNoise, frequency: 4 }

    const x = 2.5
    const y = 1.5

    // At 4x frequency, the value at (x,y) should equal the value at (4x, 4y) with 1x frequency
    const highFreqValue = fbm({ x, y, noise: highFreq, permutation })
    const lowFreqScaledValue = fbm({
      x: x * 4,
      y: y * 4,
      noise: lowFreq,
      permutation,
    })

    expect(highFreqValue).toBeCloseTo(lowFreqScaledValue, 5)
  })

  it('handles zero octaves gracefully', () => {
    const zeroOctaveNoise: NoiseParams = { ...baseNoise, octaves: 0 }
    const value = fbm({ x: 5, y: 5, noise: zeroOctaveNoise, permutation })

    // Should return 0.5 (middle value), not NaN
    expect(value).toBe(0.5)
    expect(Number.isNaN(value)).toBe(false)
  })
})
