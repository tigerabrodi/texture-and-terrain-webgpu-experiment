import type { Perlin2DParams } from '../../types'

/**
 * Fade function for smooth interpolation: 6t^5 - 15t^4 + 10t^3
 * This is the improved fade curve from Ken Perlin's improved noise.
 */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * Linear interpolation between a and b by t
 */
function lerp(t: number, a: number, b: number): number {
  return a + t * (b - a)
}

/**
 * Compute gradient dot product with distance vector.
 * Uses 8 gradient directions for 2D Perlin noise.
 */
function grad(hash: number, x: number, y: number): number {
  // Use 3 bits to select from 8 gradient directions
  const h = hash & 7
  // Gradient vectors: (1,1), (-1,1), (1,-1), (-1,-1), (1,0), (-1,0), (0,1), (0,-1)
  switch (h) {
    case 0:
      return x + y
    case 1:
      return -x + y
    case 2:
      return x - y
    case 3:
      return -x - y
    case 4:
      return x
    case 5:
      return -x
    case 6:
      return y
    case 7:
      return -y
    default:
      return 0
  }
}

/**
 * Classic 2D Perlin noise implementation.
 * Returns values in the range [-1, 1].
 */
export function perlin2D(params: Perlin2DParams): number {
  const { x, y, permutation } = params

  // Find unit grid cell containing point
  const xi = Math.floor(x) & 255
  const yi = Math.floor(y) & 255

  // Get relative coordinates within cell [0, 1)
  const xf = x - Math.floor(x)
  const yf = y - Math.floor(y)

  // Compute fade curves for each dimension
  const u = fade(xf)
  const v = fade(yf)

  // Hash coordinates of the 4 square corners
  const aa = permutation[permutation[xi] + yi]
  const ab = permutation[permutation[xi] + yi + 1]
  const ba = permutation[permutation[xi + 1] + yi]
  const bb = permutation[permutation[xi + 1] + yi + 1]

  // Compute gradient dot products for each corner
  const gradAA = grad(aa, xf, yf)
  const gradBA = grad(ba, xf - 1, yf)
  const gradAB = grad(ab, xf, yf - 1)
  const gradBB = grad(bb, xf - 1, yf - 1)

  // Bilinear interpolation
  const lerpX1 = lerp(u, gradAA, gradBA)
  const lerpX2 = lerp(u, gradAB, gradBB)
  const result = lerp(v, lerpX1, lerpX2)

  // The result is theoretically in [-1, 1] but may slightly exceed due to gradient selection
  // Clamp to ensure strict bounds
  return Math.max(-1, Math.min(1, result))
}
