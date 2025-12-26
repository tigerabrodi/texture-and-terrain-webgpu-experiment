import { beforeAll, describe, expect, it } from 'vitest'
import { deriveNormalMap } from './normalFromLuminance'

// Polyfill ImageData for Node environment
beforeAll(() => {
  if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = class ImageData {
      data: Uint8ClampedArray
      width: number
      height: number
      colorSpace: PredefinedColorSpace = 'srgb'

      constructor(
        dataOrWidth: Uint8ClampedArray | number,
        widthOrHeight: number,
        height?: number
      ) {
        if (typeof dataOrWidth === 'number') {
          // new ImageData(width, height)
          this.width = dataOrWidth
          this.height = widthOrHeight
          this.data = new Uint8ClampedArray(this.width * this.height * 4)
        } else {
          // new ImageData(data, width, height?)
          this.data = dataOrWidth
          this.width = widthOrHeight
          this.height = height ?? dataOrWidth.length / 4 / widthOrHeight
        }
      }
    } as unknown as typeof ImageData
  }
})

// Helper to create test ImageData
function createImageData(
  width: number,
  height: number,
  fill: number
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill
    data[i + 1] = fill
    data[i + 2] = fill
    data[i + 3] = 255
  }
  return new ImageData(data, width, height)
}

// Helper to create gradient ImageData (dark on left, light on right)
function createHorizontalGradient(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const value = Math.floor((x / (width - 1)) * 255)
      data[i] = value
      data[i + 1] = value
      data[i + 2] = value
      data[i + 3] = 255
    }
  }
  return new ImageData(data, width, height)
}

describe('deriveNormalMap', () => {
  it('returns ImageData of same dimensions', () => {
    const input = createImageData(32, 32, 128)
    const result = deriveNormalMap({ imageData: input, strength: 1 })

    expect(result.width).toBe(32)
    expect(result.height).toBe(32)
    expect(result.data.length).toBe(input.data.length)
  })

  it('flat input (uniform color) produces neutral normals (128, 128, 255)', () => {
    const input = createImageData(16, 16, 128)
    const result = deriveNormalMap({ imageData: input, strength: 1 })

    // Check center pixel (avoid edges where Sobel might have edge effects)
    const centerX = 8
    const centerY = 8
    const i = (centerY * 16 + centerX) * 4

    // Neutral normal should be approximately (128, 128, 255)
    expect(result.data[i]).toBeCloseTo(128, -1) // R
    expect(result.data[i + 1]).toBeCloseTo(128, -1) // G
    expect(result.data[i + 2]).toBeCloseTo(255, -1) // B
  })

  it('strength 0 produces all neutral normals', () => {
    // Use a gradient that would normally produce non-neutral normals
    const input = createHorizontalGradient(16, 16)
    const result = deriveNormalMap({ imageData: input, strength: 0 })

    // Check multiple pixels - all should be neutral
    for (let y = 1; y < 15; y++) {
      for (let x = 1; x < 15; x++) {
        const i = (y * 16 + x) * 4
        expect(result.data[i]).toBeCloseTo(128, -1) // R
        expect(result.data[i + 1]).toBeCloseTo(128, -1) // G
        expect(result.data[i + 2]).toBeCloseTo(255, -1) // B
      }
    }
  })

  it('higher strength produces more extreme normals', () => {
    const input = createHorizontalGradient(16, 16)

    const lowStrength = deriveNormalMap({ imageData: input, strength: 0.5 })
    const highStrength = deriveNormalMap({ imageData: input, strength: 2 })

    // Check center pixel
    const centerX = 8
    const centerY = 8
    const i = (centerY * 16 + centerX) * 4

    // With horizontal gradient going left to right (dark to light),
    // the normal should point left (negative X direction)
    // Higher strength should produce more deviation from 128 in R channel
    const lowDeviation = Math.abs(lowStrength.data[i] - 128)
    const highDeviation = Math.abs(highStrength.data[i] - 128)

    expect(highDeviation).toBeGreaterThan(lowDeviation)
  })
})
