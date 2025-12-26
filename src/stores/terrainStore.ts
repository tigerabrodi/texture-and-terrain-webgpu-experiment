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
      // Revoke old blob URL if replacing with a different one
      if (updates.diffuseUrl) {
        const oldUrl = textures[slotId].diffuseUrl
        if (oldUrl.startsWith('blob:') && oldUrl !== updates.diffuseUrl) {
          URL.revokeObjectURL(oldUrl)
        }
      }
      textures[slotId] = { ...textures[slotId], ...updates }
      return { textures }
    }),

  setRender: (params: Partial<RenderSettings>) =>
    set((state) => ({
      render: { ...state.render, ...params },
    })),

  resetToDefaults: () =>
    set((state) => {
      // Revoke any blob URLs before resetting
      for (const tex of state.textures) {
        if (tex.diffuseUrl.startsWith('blob:')) {
          URL.revokeObjectURL(tex.diffuseUrl)
        }
      }
      return {
        terrain: DEFAULT_TERRAIN,
        textures: DEFAULT_TEXTURES,
        render: DEFAULT_RENDER,
      }
    }),
}))
