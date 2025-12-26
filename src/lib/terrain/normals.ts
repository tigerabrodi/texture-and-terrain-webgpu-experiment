import type { CalculateNormalsParams } from '../../types'

/**
 * Calculate vertex normals for terrain mesh from heightmap data.
 * Uses cross product of neighboring height differences to compute surface normal.
 * Edge vertices use clamped neighbor indices.
 * All normals are normalized to unit length.
 */
export function calculateNormals(params: CalculateNormalsParams): Float32Array {
  const { heightmap, resolution, worldSize } = params
  const normals = new Float32Array(resolution * resolution * 3)

  // Spacing between vertices in world units
  const spacing = worldSize / (resolution - 1)

  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const index = z * resolution + x

      // Get clamped neighbor indices
      const xLeft = Math.max(0, x - 1)
      const xRight = Math.min(resolution - 1, x + 1)
      const zBack = Math.max(0, z - 1)
      const zFront = Math.min(resolution - 1, z + 1)

      // Get heights at neighboring vertices
      const hLeft = heightmap[z * resolution + xLeft] * worldSize
      const hRight = heightmap[z * resolution + xRight] * worldSize
      const hBack = heightmap[zBack * resolution + x] * worldSize
      const hFront = heightmap[zFront * resolution + x] * worldSize

      // Calculate horizontal distances (accounting for edge clamping)
      const dxScale = x === 0 || x === resolution - 1 ? 1 : 2
      const dzScale = z === 0 || z === resolution - 1 ? 1 : 2

      // Compute tangent vectors using finite differences
      // Tangent in X direction: (spacing * dxScale, hRight - hLeft, 0)
      // Tangent in Z direction: (0, hFront - hBack, spacing * dzScale)
      const tx = spacing * dxScale
      const ty_x = hRight - hLeft
      const tz = spacing * dzScale
      const ty_z = hFront - hBack

      // Cross product of tangent vectors (Z x X) for counter-clockwise winding
      // Z tangent = (0, ty_z, tz)
      // X tangent = (tx, ty_x, 0)
      // Cross = Z x X = (ty_z * 0 - tz * ty_x, tz * tx - 0 * 0, 0 * ty_x - ty_z * tx)
      //               = (-tz * ty_x, tz * tx, -ty_z * tx)
      let nx = -tz * ty_x
      let ny = tz * tx
      let nz = -ty_z * tx

      // Normalize the normal vector
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz)
      if (length > 0) {
        nx /= length
        ny /= length
        nz /= length
      } else {
        // Fallback for degenerate case
        nx = 0
        ny = 1
        nz = 0
      }

      normals[index * 3] = nx
      normals[index * 3 + 1] = ny
      normals[index * 3 + 2] = nz
    }
  }

  return normals
}
