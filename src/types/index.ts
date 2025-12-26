// ============ Core Parameters ============

export type NoiseParams = {
  seed: number
  frequency: number
  amplitude: number
  octaves: number
  lacunarity: number
  persistence: number
}

export type TerrainParams = {
  worldSize: number
  resolution: number
  noise: NoiseParams
}

export type TextureSlot = {
  id: 0 | 1 | 2
  name: string
  diffuseUrl: string
  normalUrl: string | null // null = derive from diffuse
  heightStart: number // 0-1, where texture begins
  heightEnd: number // 0-1, where texture ends
  slopeStart: number // 0-1, slope threshold start
  slopeEnd: number // 0-1, slope threshold end
  slopeInfluence: number // 0-1, how much slope affects blend
}

export type RenderSettings = {
  triplanarEnabled: boolean
  triplanarSharpness: number // 1-8, higher = sharper blend
  heightBlendEnabled: boolean
  heightBlendStrength: number // 0-1
  antiTileEnabled: boolean
  wireframe: boolean
  textureScale: number // Tiling factor
}

// ============ Function Parameters ============

export type GeneratePermutationParams = {
  seed: number
}

export type Perlin2DParams = {
  x: number
  y: number
  permutation: Uint8Array
}

export type FbmParams = {
  x: number
  y: number
  noise: NoiseParams
  permutation: Uint8Array
}

export type GenerateHeightmapParams = {
  resolution: number
  noise: NoiseParams
}

export type CalculateNormalsParams = {
  heightmap: Float32Array
  resolution: number
  worldSize: number
}

export type BuildPositionsParams = {
  heightmap: Float32Array
  resolution: number
  worldSize: number
}

export type BuildIndicesParams = {
  resolution: number
}

export type BuildUVsParams = {
  resolution: number
}

export type CalculateSlopeParams = {
  normal: readonly [number, number, number]
}

export type CalculateSplatWeightsParams = {
  height: number
  slope: number
  slots: readonly TextureSlot[]
}

export type DeriveNormalMapParams = {
  imageData: ImageData
  strength: number
}

// ============ Return Types ============

export type SplatWeight = {
  textureIndex: number
  weight: number
}

export type GeometryBuffers = {
  positions: Float32Array
  normals: Float32Array
  uvs: Float32Array
  indices: Uint32Array
}

// ============ Store Types ============

export type TerrainState = {
  terrain: TerrainParams
  textures: [TextureSlot, TextureSlot, TextureSlot]
  render: RenderSettings
}

export type TerrainActions = {
  setNoise: (params: Partial<NoiseParams>) => void
  setTerrainSize: (params: { worldSize?: number; resolution?: number }) => void
  setTexture: (params: {
    slotId: 0 | 1 | 2
    updates: Partial<TextureSlot>
  }) => void
  setRender: (params: Partial<RenderSettings>) => void
  resetToDefaults: () => void
}

export type TerrainStore = TerrainState & TerrainActions
