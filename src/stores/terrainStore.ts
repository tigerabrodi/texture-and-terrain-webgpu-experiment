import { create } from 'zustand'
import type { TerrainStore, NoiseParams, TextureSlot, RenderSettings } from '../types'
import {
  DEFAULT_TERRAIN,
  DEFAULT_TEXTURES,
  DEFAULT_RENDER,
} from '../constants/defaults'

export const useTerrainStore = create<TerrainStore>((set) => ({
  terrain: DEFAULT_TERRAIN,
  textures: DEFAULT_TEXTURES,
  render: DEFAULT_RENDER,

  setNoise: (params: Partial<NoiseParams>) =>
    set((state) => ({
      terrain: {
        ...state.terrain,
        noise: { ...state.terrain.noise, ...params },
      },
    })),

  setTerrainSize: (params: { worldSize?: number; resolution?: number }) =>
    set((state) => ({
      terrain: { ...state.terrain, ...params },
    })),

  setTexture: ({
    slotId,
    updates,
  }: {
    slotId: 0 | 1 | 2
    updates: Partial<TextureSlot>
  }) =>
    set((state) => {
      const textures = [...state.textures] as [
        TextureSlot,
        TextureSlot,
        TextureSlot,
      ]
      textures[slotId] = { ...textures[slotId], ...updates }
      return { textures }
    }),

  setRender: (params: Partial<RenderSettings>) =>
    set((state) => ({
      render: { ...state.render, ...params },
    })),

  resetToDefaults: () =>
    set({
      terrain: DEFAULT_TERRAIN,
      textures: DEFAULT_TEXTURES,
      render: DEFAULT_RENDER,
    }),
}))
