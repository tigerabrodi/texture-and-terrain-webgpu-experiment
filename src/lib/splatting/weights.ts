import type { CalculateSplatWeightsParams, SplatWeight } from '../../types'

/**
 * Smoothstep interpolation function.
 * Returns 0 if x <= edge0, 1 if x >= edge1, smooth interpolation in between.
 */
function smoothstep(edge0: number, edge1: number, x: number): number {
  // Clamp x to [0, 1] range relative to edges
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  // Smoothstep polynomial: 3t^2 - 2t^3
  return t * t * (3 - 2 * t)
}

/**
 * Calculate the weight for a value within a range using smoothstep.
 * Returns 1 in the middle of the range, smooth falloff at edges.
 */
function calculateRangeWeight(
  value: number,
  start: number,
  end: number
): number {
  if (value < start || value > end) {
    return 0
  }

  const mid = (start + end) / 2

  if (value <= mid) {
    // Ramp up from start to mid
    return smoothstep(start, mid, value)
  } else {
    // Ramp down from mid to end
    return 1 - smoothstep(mid, end, value)
  }
}

/**
 * Calculate splat weights for texture blending based on height and slope.
 *
 * @param params - Contains height (0-1), slope (0-1), and texture slots
 * @returns Array of {textureIndex, weight} objects, weights sum to 1
 */
export function calculateSplatWeights(
  params: CalculateSplatWeightsParams
): SplatWeight[] {
  const { height, slope, slots } = params

  // Calculate raw weights for each slot
  const rawWeights: { textureIndex: number; weight: number }[] = []

  for (const slot of slots) {
    // Calculate height weight using the range
    const heightWeight = calculateRangeWeight(
      height,
      slot.heightStart,
      slot.heightEnd
    )

    // Calculate slope weight using the range
    const slopeWeight = calculateRangeWeight(
      slope,
      slot.slopeStart,
      slot.slopeEnd
    )

    // Combine weights based on slopeInfluence
    // finalWeight = heightWeight * (1 - slopeInfluence) + slopeWeight * slopeInfluence
    const finalWeight =
      heightWeight * (1 - slot.slopeInfluence) +
      slopeWeight * slot.slopeInfluence

    if (finalWeight > 0) {
      rawWeights.push({
        textureIndex: slot.id,
        weight: finalWeight,
      })
    }
  }

  // Handle edge case: no weights calculated
  if (rawWeights.length === 0) {
    // Default to first slot with full weight
    return [{ textureIndex: 0, weight: 1 }]
  }

  // Normalize weights to sum to 1
  const totalWeight = rawWeights.reduce((sum, w) => sum + w.weight, 0)

  const normalizedWeights: SplatWeight[] = rawWeights.map((w) => ({
    textureIndex: w.textureIndex,
    weight: w.weight / totalWeight,
  }))

  // Filter out effectively zero weights (after normalization)
  return normalizedWeights.filter((w) => w.weight > 1e-6)
}
