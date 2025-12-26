import type {
  NoiseParams,
  RenderSettings,
  TerrainParams,
  TextureSlot,
} from '../types'

import grassTexture from '../assets/texture-dead-dry-grass-brown-yellow.webp'
import rockTexture from '../assets/texture-rough-gray-stone-rubble.webp'
import woodTexture from '../assets/texture-dark-wood-ceiling-planks-victorian.webp'

export const DEFAULT_NOISE: NoiseParams = {
  seed: 12345,
  frequency: 2,
  amplitude: 1,
  octaves: 4,
  lacunarity: 2,
  persistence: 0.5,
}

export const DEFAULT_TERRAIN: TerrainParams = {
  worldSize: 100,
  resolution: 128,
  noise: DEFAULT_NOISE,
}

export const DEFAULT_TEXTURES: [TextureSlot, TextureSlot, TextureSlot] = [
  {
    id: 0,
    name: 'Grass',
    diffuseUrl: grassTexture,
    normalUrl: null,
    heightStart: 0,
    heightEnd: 0.4,
    slopeStart: 0.7,
    slopeEnd: 1.0,
    slopeInfluence: 0.3,
  },
  {
    id: 1,
    name: 'Rock',
    diffuseUrl: rockTexture,
    normalUrl: null,
    heightStart: 0.3,
    heightEnd: 0.7,
    slopeStart: 0.4,
    slopeEnd: 0.7,
    slopeInfluence: 0.7,
  },
  {
    id: 2,
    name: 'Wood',
    diffuseUrl: woodTexture,
    normalUrl: null,
    heightStart: 0.6,
    heightEnd: 1.0,
    slopeStart: 0.8,
    slopeEnd: 1.0,
    slopeInfluence: 0.2,
  },
]

export const DEFAULT_RENDER: RenderSettings = {
  triplanarEnabled: true,
  triplanarSharpness: 4,
  heightBlendEnabled: true,
  heightBlendStrength: 0.3,
  antiTileEnabled: true,
  wireframe: false,
  textureScale: 0.1,
}
