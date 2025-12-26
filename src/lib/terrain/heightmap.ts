import type { GenerateHeightmapParams } from '../../types'
import { fbm } from '../noise/fbm'
import { generatePermutation } from '../noise/permutation'

/**
 * Generates a heightmap using Fractal Brownian Motion noise.
 * Returns a Float32Array of length resolution^2 with values in [0, 1].
 * Index layout: [y * resolution + x]
 */
export function generateHeightmap(
  params: GenerateHeightmapParams
): Float32Array {
  const { resolution, noise } = params

  // Generate permutation table from seed
  const permutation = generatePermutation({ seed: noise.seed })

  // Allocate heightmap
  const heightmap = new Float32Array(resolution * resolution)

  // Sample FBM at each grid point
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Normalize coordinates to [0, 1] range
      const nx = x / (resolution - 1)
      const ny = y / (resolution - 1)

      // Sample FBM noise
      const height = fbm({
        x: nx,
        y: ny,
        noise,
        permutation,
      })

      // Store in heightmap (row-major order)
      heightmap[y * resolution + x] = height
    }
  }

  return heightmap
}
