import type { DeriveNormalMapParams } from '../../types'

/**
 * Convert RGB pixel to luminance (grayscale value).
 * Uses standard luminance weights.
 */
function rgbToLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/**
 * Get luminance at a pixel position, clamping to edges.
 */
function getLuminance(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): number {
  // Clamp coordinates to image bounds
  const cx = Math.max(0, Math.min(width - 1, x))
  const cy = Math.max(0, Math.min(height - 1, y))

  const i = (cy * width + cx) * 4
  return rgbToLuminance(data[i], data[i + 1], data[i + 2])
}

/**
 * Derive a normal map from a grayscale/color image using the Sobel operator.
 *
 * @param params - Contains ImageData and strength parameter
 * @returns New ImageData with encoded normal map
 */
export function deriveNormalMap(params: DeriveNormalMapParams): ImageData {
  const { imageData, strength } = params
  const { width, height, data } = imageData

  // Create output ImageData
  const outputData = new Uint8ClampedArray(width * height * 4)

  // Sobel kernels
  // Gx (horizontal gradient):
  // -1  0  1
  // -2  0  2
  // -1  0  1

  // Gy (vertical gradient):
  // -1 -2 -1
  //  0  0  0
  //  1  2  1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Get surrounding luminance values
      const tl = getLuminance(data, width, height, x - 1, y - 1)
      const t = getLuminance(data, width, height, x, y - 1)
      const tr = getLuminance(data, width, height, x + 1, y - 1)
      const l = getLuminance(data, width, height, x - 1, y)
      const r = getLuminance(data, width, height, x + 1, y)
      const bl = getLuminance(data, width, height, x - 1, y + 1)
      const b = getLuminance(data, width, height, x, y + 1)
      const br = getLuminance(data, width, height, x + 1, y + 1)

      // Calculate Sobel gradients
      const gx = -tl + tr - 2 * l + 2 * r - bl + br
      const gy = -tl - 2 * t - tr + bl + 2 * b + br

      // Normalize gradients to [-1, 1] range
      // Sobel can produce values in range [-4*255, 4*255] = [-1020, 1020]
      // But typically much smaller for normal images
      const scale = strength / 255

      let nx = -gx * scale
      let ny = -gy * scale
      let nz = 1

      // Normalize the vector
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz)
      nx /= len
      ny /= len
      nz /= len

      // Encode normal to RGB
      // R = (nx + 1) / 2 * 255
      // G = (ny + 1) / 2 * 255
      // B = nz * 255
      const i = (y * width + x) * 4
      outputData[i] = Math.round(((nx + 1) / 2) * 255) // R
      outputData[i + 1] = Math.round(((ny + 1) / 2) * 255) // G
      outputData[i + 2] = Math.round(nz * 255) // B
      outputData[i + 3] = 255 // A
    }
  }

  return new ImageData(outputData, width, height)
}
