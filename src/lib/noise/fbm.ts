import type { FbmParams } from '../../types'
import { perlin2D } from './perlin'

/**
 * Fractal Brownian Motion - layers multiple octaves of Perlin noise.
 * Returns normalized values in the range [0, 1].
 *
 * Each octave:
 * - frequency *= lacunarity (usually 2.0)
 * - amplitude *= persistence (usually 0.5)
 */
export function fbm(params: FbmParams): number {
  const { x, y, noise, permutation } = params
  const { frequency, octaves, lacunarity, persistence } = noise

  let total = 0
  let amplitude = 1
  let freq = frequency
  let maxValue = 0 // Used for normalizing the result

  for (let i = 0; i < octaves; i++) {
    // Sample Perlin noise at scaled coordinates
    const noiseValue = perlin2D({
      x: x * freq,
      y: y * freq,
      permutation,
    })

    total += noiseValue * amplitude
    maxValue += amplitude

    // Update for next octave
    amplitude *= persistence
    freq *= lacunarity
  }

  // Normalize from [-maxValue, maxValue] to [0, 1]
  const normalized = (total / maxValue + 1) / 2

  // Clamp to ensure strict [0, 1] bounds
  return Math.max(0, Math.min(1, normalized))
}
