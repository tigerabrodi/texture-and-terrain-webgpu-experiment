import { describe, expect, it } from 'vitest'
import type { TextureSlot } from '../../types'
import { calculateSlope } from './slope'
import { calculateSplatWeights } from './weights'

describe('calculateSlope', () => {
  it('returns 0 for up-facing normal (0, 1, 0)', () => {
    const result = calculateSlope({ normal: [0, 1, 0] })
    expect(result).toBe(0)
  })

  it('returns 1 for horizontal normal (1, 0, 0)', () => {
    const result = calculateSlope({ normal: [1, 0, 0] })
    expect(result).toBe(1)
  })

  it('returns ~0.293 for 45-degree slope', () => {
    // At 45 degrees, normal.y = cos(45) = sqrt(2)/2 ≈ 0.707
    // slope = 1 - 0.707 ≈ 0.293
    const sqrt2over2 = Math.SQRT2 / 2
    const result = calculateSlope({ normal: [sqrt2over2, sqrt2over2, 0] })
    expect(result).toBeCloseTo(0.293, 2)
  })

  it('handles all horizontal directions equally', () => {
    const slopeX = calculateSlope({ normal: [1, 0, 0] })
    const slopeNegX = calculateSlope({ normal: [-1, 0, 0] })
    const slopeZ = calculateSlope({ normal: [0, 0, 1] })
    const slopeNegZ = calculateSlope({ normal: [0, 0, -1] })

    expect(slopeX).toBe(1)
    expect(slopeNegX).toBe(1)
    expect(slopeZ).toBe(1)
    expect(slopeNegZ).toBe(1)
  })
})

describe('calculateSplatWeights', () => {
  const defaultSlots: TextureSlot[] = [
    {
      id: 0,
      name: 'grass',
      diffuseUrl: '',
      normalUrl: null,
      heightStart: 0,
      heightEnd: 0.4,
      slopeStart: 0.7,
      slopeEnd: 1,
      slopeInfluence: 0.5,
    },
    {
      id: 1,
      name: 'rock',
      diffuseUrl: '',
      normalUrl: null,
      heightStart: 0.3,
      heightEnd: 0.7,
      slopeStart: 0.5,
      slopeEnd: 0.8,
      slopeInfluence: 0.5,
    },
    {
      id: 2,
      name: 'snow',
      diffuseUrl: '',
      normalUrl: null,
      heightStart: 0.6,
      heightEnd: 1.0,
      slopeStart: 0.8,
      slopeEnd: 1,
      slopeInfluence: 0.3,
    },
  ]

  it('returns weights that sum to 1', () => {
    const result = calculateSplatWeights({
      height: 0.5,
      slope: 0.5,
      slots: defaultSlots,
    })

    const sum = result.reduce((acc, w) => acc + w.weight, 0)
    expect(sum).toBeCloseTo(1, 5)
  })

  it('low height + flat slope favors texture 0 (grass)', () => {
    const result = calculateSplatWeights({
      height: 0.1,
      slope: 0.0,
      slots: defaultSlots,
    })

    // Find grass weight
    const grassWeight = result.find((w) => w.textureIndex === 0)
    expect(grassWeight).toBeDefined()
    expect(grassWeight!.weight).toBeGreaterThan(0.5)
  })

  it('high height + flat slope favors texture 2 (snow)', () => {
    const result = calculateSplatWeights({
      height: 0.9,
      slope: 0.0,
      slots: defaultSlots,
    })

    // Find snow weight
    const snowWeight = result.find((w) => w.textureIndex === 2)
    expect(snowWeight).toBeDefined()
    expect(snowWeight!.weight).toBeGreaterThan(0.5)
  })

  it('steep slope increases rock weight regardless of height', () => {
    // Use slope 0.65 which is in the middle of rock's slope range (0.5-0.8)
    const lowHeightSteep = calculateSplatWeights({
      height: 0.1,
      slope: 0.65,
      slots: defaultSlots,
    })

    const highHeightSteep = calculateSplatWeights({
      height: 0.9,
      slope: 0.65,
      slots: defaultSlots,
    })

    // Rock should have significant weight in both cases due to steep slope
    const rockWeightLow = lowHeightSteep.find((w) => w.textureIndex === 1)
    const rockWeightHigh = highHeightSteep.find((w) => w.textureIndex === 1)

    expect(rockWeightLow).toBeDefined()
    expect(rockWeightHigh).toBeDefined()
    expect(rockWeightLow!.weight).toBeGreaterThan(0.2)
    expect(rockWeightHigh!.weight).toBeGreaterThan(0.2)
  })

  it('mid height blends between adjacent textures', () => {
    const result = calculateSplatWeights({
      height: 0.35,
      slope: 0.0,
      slots: defaultSlots,
    })

    // At height 0.35, should have both grass (0-0.4) and rock (0.3-0.7)
    const grassWeight = result.find((w) => w.textureIndex === 0)
    const rockWeight = result.find((w) => w.textureIndex === 1)

    expect(grassWeight).toBeDefined()
    expect(rockWeight).toBeDefined()
    expect(grassWeight!.weight).toBeGreaterThan(0)
    expect(rockWeight!.weight).toBeGreaterThan(0)
  })

  it('returns max 3 weights for 3 slots', () => {
    const result = calculateSplatWeights({
      height: 0.5,
      slope: 0.5,
      slots: defaultSlots,
    })

    expect(result.length).toBeLessThanOrEqual(3)
  })

  it('filters out zero weights', () => {
    const result = calculateSplatWeights({
      height: 0.0,
      slope: 0.0,
      slots: defaultSlots,
    })

    // All weights should be > 0
    for (const w of result) {
      expect(w.weight).toBeGreaterThan(0)
    }
  })
})
