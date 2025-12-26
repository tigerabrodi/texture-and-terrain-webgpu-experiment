import type { CalculateSlopeParams } from '../../types'

/**
 * Calculate slope from a normal vector.
 *
 * @param params - Contains the normal vector [x, y, z]
 * @returns Slope value in range [0, 1] where 0 = flat (up-facing) and 1 = vertical
 */
export function calculateSlope(params: CalculateSlopeParams): number {
  const { normal } = params
  // slope = 1 - normal.y
  // Up-facing (0, 1, 0) returns 0 (flat)
  // Horizontal (1, 0, 0) returns 1 (vertical)
  return 1 - normal[1]
}
