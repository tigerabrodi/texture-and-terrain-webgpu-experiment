import { describe, expect, it } from 'vitest'
import { buildIndices, buildPositions, buildUVs } from './geometry'
import { calculateNormals } from './normals'

describe('calculateNormals', () => {
  it('returns Float32Array of length resolution^2 * 3', () => {
    const resolution = 4
    const heightmap = new Float32Array(resolution * resolution).fill(0)
    const result = calculateNormals({
      heightmap,
      resolution,
      worldSize: 10,
    })

    expect(result).toBeInstanceOf(Float32Array)
    expect(result.length).toBe(resolution * resolution * 3)
  })

  it('flat terrain has all normals pointing up (0, 1, 0)', () => {
    const resolution = 4
    const heightmap = new Float32Array(resolution * resolution).fill(0.5)
    const result = calculateNormals({
      heightmap,
      resolution,
      worldSize: 10,
    })

    for (let i = 0; i < resolution * resolution; i++) {
      const nx = result[i * 3]
      const ny = result[i * 3 + 1]
      const nz = result[i * 3 + 2]

      expect(nx).toBeCloseTo(0, 5)
      expect(ny).toBeCloseTo(1, 5)
      expect(nz).toBeCloseTo(0, 5)
    }
  })

  it('slope in +X direction tilts normal toward -X', () => {
    const resolution = 3
    // Create a heightmap that slopes upward in +X direction
    // Row 0: 0, 0.5, 1
    // Row 1: 0, 0.5, 1
    // Row 2: 0, 0.5, 1
    const heightmap = new Float32Array([0, 0.5, 1, 0, 0.5, 1, 0, 0.5, 1])

    const result = calculateNormals({
      heightmap,
      resolution,
      worldSize: 10,
    })

    // Check center vertex (index 4)
    const centerIndex = 4
    const nx = result[centerIndex * 3]
    const ny = result[centerIndex * 3 + 1]
    const nz = result[centerIndex * 3 + 2]

    // Normal should tilt toward -X (nx < 0)
    expect(nx).toBeLessThan(0)
    // Normal should still have positive Y component
    expect(ny).toBeGreaterThan(0)
    // No slope in Z, so nz should be ~0
    expect(nz).toBeCloseTo(0, 3)
  })

  it('all normals are normalized (length = 1)', () => {
    const resolution = 5
    // Create some varied terrain
    const heightmap = new Float32Array(resolution * resolution)
    for (let i = 0; i < heightmap.length; i++) {
      heightmap[i] = Math.sin(i * 0.5) * 0.5 + 0.5
    }

    const result = calculateNormals({
      heightmap,
      resolution,
      worldSize: 10,
    })

    for (let i = 0; i < resolution * resolution; i++) {
      const nx = result[i * 3]
      const ny = result[i * 3 + 1]
      const nz = result[i * 3 + 2]

      const length = Math.sqrt(nx * nx + ny * ny + nz * nz)
      expect(length).toBeCloseTo(1, 5)
    }
  })
})

describe('buildPositions', () => {
  it('returns Float32Array of length resolution^2 * 3', () => {
    const resolution = 4
    const heightmap = new Float32Array(resolution * resolution).fill(0)
    const result = buildPositions({
      heightmap,
      resolution,
      worldSize: 10,
    })

    expect(result).toBeInstanceOf(Float32Array)
    expect(result.length).toBe(resolution * resolution * 3)
  })

  it('positions span from -worldSize/2 to +worldSize/2 in X and Z', () => {
    const resolution = 3
    const worldSize = 20
    const heightmap = new Float32Array(resolution * resolution).fill(0)
    const result = buildPositions({
      heightmap,
      resolution,
      worldSize,
    })

    // First vertex (0, 0) should be at (-10, y, -10)
    expect(result[0]).toBeCloseTo(-worldSize / 2, 5) // X
    expect(result[2]).toBeCloseTo(-worldSize / 2, 5) // Z

    // Last vertex (2, 2) should be at (+10, y, +10)
    const lastIndex = (resolution * resolution - 1) * 3
    expect(result[lastIndex]).toBeCloseTo(worldSize / 2, 5) // X
    expect(result[lastIndex + 2]).toBeCloseTo(worldSize / 2, 5) // Z
  })

  it('Y values equal heightmap * worldSize', () => {
    const resolution = 2
    const worldSize = 10
    const heightmap = new Float32Array([0, 0.25, 0.5, 1])
    const result = buildPositions({
      heightmap,
      resolution,
      worldSize,
    })

    // Check Y values
    expect(result[1]).toBeCloseTo(0 * worldSize, 5)
    expect(result[4]).toBeCloseTo(0.25 * worldSize, 5)
    expect(result[7]).toBeCloseTo(0.5 * worldSize, 5)
    expect(result[10]).toBeCloseTo(1 * worldSize, 5)
  })
})

describe('buildUVs', () => {
  it('returns Float32Array of length resolution^2 * 2', () => {
    const resolution = 4
    const result = buildUVs({ resolution })

    expect(result).toBeInstanceOf(Float32Array)
    expect(result.length).toBe(resolution * resolution * 2)
  })

  it('UVs span 0 to 1', () => {
    const resolution = 3
    const result = buildUVs({ resolution })

    // First vertex (0, 0) should have UV (0, 0)
    expect(result[0]).toBeCloseTo(0, 5)
    expect(result[1]).toBeCloseTo(0, 5)

    // Last vertex (2, 2) should have UV (1, 1)
    const lastIndex = (resolution * resolution - 1) * 2
    expect(result[lastIndex]).toBeCloseTo(1, 5)
    expect(result[lastIndex + 1]).toBeCloseTo(1, 5)

    // Middle vertex (1, 1) should have UV (0.5, 0.5)
    const middleIndex = 4 * 2 // vertex at row 1, col 1
    expect(result[middleIndex]).toBeCloseTo(0.5, 5)
    expect(result[middleIndex + 1]).toBeCloseTo(0.5, 5)
  })
})

describe('buildIndices', () => {
  it('returns Uint32Array', () => {
    const resolution = 4
    const result = buildIndices({ resolution })

    expect(result).toBeInstanceOf(Uint32Array)
  })

  it('creates correct number of triangles: (resolution-1)^2 * 2', () => {
    const resolution = 4
    const result = buildIndices({ resolution })

    const expectedQuads = (resolution - 1) * (resolution - 1)
    const expectedTriangles = expectedQuads * 2
    const expectedIndices = expectedTriangles * 3

    expect(result.length).toBe(expectedIndices)
  })

  it('all indices are within bounds [0, resolution^2 - 1]', () => {
    const resolution = 5
    const result = buildIndices({ resolution })

    const maxIndex = resolution * resolution - 1
    for (let i = 0; i < result.length; i++) {
      expect(result[i]).toBeGreaterThanOrEqual(0)
      expect(result[i]).toBeLessThanOrEqual(maxIndex)
    }
  })

  it('indices form valid triangles (no degenerate)', () => {
    const resolution = 4
    const result = buildIndices({ resolution })

    // Check each triangle has 3 distinct vertices
    for (let i = 0; i < result.length; i += 3) {
      const a = result[i]
      const b = result[i + 1]
      const c = result[i + 2]

      expect(a).not.toBe(b)
      expect(b).not.toBe(c)
      expect(c).not.toBe(a)
    }
  })
})
