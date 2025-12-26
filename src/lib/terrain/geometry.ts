import type {
  BuildIndicesParams,
  BuildPositionsParams,
  BuildUVsParams,
} from '../../types'

/**
 * Build vertex positions for terrain mesh.
 * X and Z span from -worldSize/2 to +worldSize/2.
 * Y = heightmap value * worldSize.
 * Layout: [x, y, z, x, y, z, ...]
 */
export function buildPositions(params: BuildPositionsParams): Float32Array {
  const { heightmap, resolution, worldSize } = params
  const positions = new Float32Array(resolution * resolution * 3)

  const halfSize = worldSize / 2
  const spacing = worldSize / (resolution - 1)

  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const index = z * resolution + x
      const heightValue = heightmap[index]

      positions[index * 3] = -halfSize + x * spacing // X
      positions[index * 3 + 1] = heightValue * worldSize // Y
      positions[index * 3 + 2] = -halfSize + z * spacing // Z
    }
  }

  return positions
}

/**
 * Build UV coordinates for terrain mesh.
 * UVs span from 0 to 1 across the terrain.
 * Layout: [u, v, u, v, ...]
 */
export function buildUVs(params: BuildUVsParams): Float32Array {
  const { resolution } = params
  const uvs = new Float32Array(resolution * resolution * 2)

  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const index = z * resolution + x

      uvs[index * 2] = x / (resolution - 1) // U
      uvs[index * 2 + 1] = z / (resolution - 1) // V
    }
  }

  return uvs
}

/**
 * Build triangle indices for terrain mesh.
 * Creates (resolution-1)^2 * 2 triangles (2 per quad).
 * Uses counter-clockwise winding.
 */
export function buildIndices(params: BuildIndicesParams): Uint32Array {
  const { resolution } = params
  const quadsPerRow = resolution - 1
  const totalQuads = quadsPerRow * quadsPerRow
  const indices = new Uint32Array(totalQuads * 6) // 2 triangles * 3 indices per quad

  let indexOffset = 0

  for (let z = 0; z < quadsPerRow; z++) {
    for (let x = 0; x < quadsPerRow; x++) {
      // Vertex indices for this quad
      const topLeft = z * resolution + x
      const topRight = z * resolution + x + 1
      const bottomLeft = (z + 1) * resolution + x
      const bottomRight = (z + 1) * resolution + x + 1

      // First triangle (counter-clockwise: top-left, bottom-left, bottom-right)
      indices[indexOffset++] = topLeft
      indices[indexOffset++] = bottomLeft
      indices[indexOffset++] = bottomRight

      // Second triangle (counter-clockwise: top-left, bottom-right, top-right)
      indices[indexOffset++] = topLeft
      indices[indexOffset++] = bottomRight
      indices[indexOffset++] = topRight
    }
  }

  return indices
}
