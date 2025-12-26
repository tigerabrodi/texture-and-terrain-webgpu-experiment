import type { GeneratePermutationParams } from '../../types'

/**
 * Generates a permutation table for use in Perlin noise.
 * Returns a Uint8Array of length 512 containing values 0-255,
 * each appearing exactly twice (doubled for wraparound optimization).
 *
 * Uses a Linear Congruential Generator (LCG) for deterministic shuffling.
 */
export function generatePermutation(
  params: GeneratePermutationParams
): Uint8Array {
  const { seed } = params

  // Create initial array with values 0-255
  const perm = new Uint8Array(512)
  for (let i = 0; i < 256; i++) {
    perm[i] = i
  }

  // LCG parameters (same as glibc)
  const a = 1103515245
  const c = 12345
  const m = 2 ** 31

  // Initialize LCG state from seed
  let state = Math.abs(seed) % m

  // Fisher-Yates shuffle using LCG for randomness
  for (let i = 255; i > 0; i--) {
    state = (a * state + c) % m
    const j = state % (i + 1)

    // Swap
    const temp = perm[i]
    perm[i] = perm[j]
    perm[j] = temp
  }

  // Double the permutation for wraparound (avoid modulo in hot path)
  for (let i = 0; i < 256; i++) {
    perm[256 + i] = perm[i]
  }

  return perm
}
