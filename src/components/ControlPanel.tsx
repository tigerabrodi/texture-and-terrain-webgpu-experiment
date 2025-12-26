import { useEffect } from 'react'
import { useTerrainStore } from '../stores/terrainStore'
import { SliderControl } from './SliderControl'
import { ToggleControl } from './ToggleControl'
import { SectionPanel } from './SectionPanel'

// Resolution values as powers of 2
const RESOLUTION_VALUES = [32, 64, 128, 256, 512]

function findClosestResolution(value: number): number {
  return RESOLUTION_VALUES.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  )
}

export function ControlPanel() {
  const terrain = useTerrainStore((state) => state.terrain)
  const render = useTerrainStore((state) => state.render)
  const textures = useTerrainStore((state) => state.textures)
  const setNoise = useTerrainStore((state) => state.setNoise)
  const setTerrainSize = useTerrainStore((state) => state.setTerrainSize)
  const setRender = useTerrainStore((state) => state.setRender)
  const setTexture = useTerrainStore((state) => state.setTexture)
  const resetToDefaults = useTerrainStore((state) => state.resetToDefaults)

  // Handle resolution slider with discrete power-of-2 steps
  const handleResolutionChange = (value: number) => {
    const resolution = findClosestResolution(value)
    setTerrainSize({ resolution })
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement) return

      switch (e.key.toLowerCase()) {
        case 'w':
          setRender({ wireframe: !render.wireframe })
          break
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            resetToDefaults()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [render.wireframe, setRender, resetToDefaults])

  return (
    <div className="fixed left-4 top-4 bottom-4 w-[280px] bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-white font-semibold">Controls</h2>
        <button
          type="button"
          onClick={resetToDefaults}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          Reset (R)
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Terrain Section */}
        <SectionPanel title="Terrain" defaultOpen>
          <SliderControl
            label="World Size"
            value={terrain.worldSize}
            min={10}
            max={500}
            step={10}
            onChange={(value) => setTerrainSize({ worldSize: value })}
          />
          <SliderControl
            label="Resolution"
            value={terrain.resolution}
            min={32}
            max={512}
            step={32}
            onChange={handleResolutionChange}
          />
        </SectionPanel>

        {/* Noise Section */}
        <SectionPanel title="Noise" defaultOpen>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Seed</label>
            <input
              type="number"
              value={terrain.noise.seed}
              onChange={(e) => setNoise({ seed: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <SliderControl
            label="Frequency"
            value={terrain.noise.frequency}
            min={0.1}
            max={10}
            step={0.1}
            onChange={(value) => setNoise({ frequency: value })}
          />
          <SliderControl
            label="Amplitude"
            value={terrain.noise.amplitude}
            min={0.1}
            max={2}
            step={0.1}
            onChange={(value) => setNoise({ amplitude: value })}
          />
          <SliderControl
            label="Octaves"
            value={terrain.noise.octaves}
            min={1}
            max={8}
            step={1}
            onChange={(value) => setNoise({ octaves: value })}
          />
          <SliderControl
            label="Lacunarity"
            value={terrain.noise.lacunarity}
            min={1}
            max={4}
            step={0.1}
            onChange={(value) => setNoise({ lacunarity: value })}
          />
          <SliderControl
            label="Persistence"
            value={terrain.noise.persistence}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(value) => setNoise({ persistence: value })}
          />
        </SectionPanel>

        {/* Render Section */}
        <SectionPanel title="Render" defaultOpen>
          <ToggleControl
            label="Wireframe (W)"
            checked={render.wireframe}
            onChange={(checked) => setRender({ wireframe: checked })}
          />
          <SliderControl
            label="Texture Scale"
            value={render.textureScale}
            min={0.01}
            max={1}
            step={0.01}
            onChange={(value) => setRender({ textureScale: value })}
          />
          <ToggleControl
            label="Tri-Planar"
            checked={render.triplanarEnabled}
            onChange={(checked) => setRender({ triplanarEnabled: checked })}
          />
          <ToggleControl
            label="Height Blend"
            checked={render.heightBlendEnabled}
            onChange={(checked) => setRender({ heightBlendEnabled: checked })}
          />
          <ToggleControl
            label="Anti-Tile"
            checked={render.antiTileEnabled}
            onChange={(checked) => setRender({ antiTileEnabled: checked })}
          />
        </SectionPanel>

        {/* Texture Blend Sections */}
        {textures.map((tex, idx) => (
          <SectionPanel key={tex.id} title={`${tex.name} Blend`} defaultOpen={false}>
            <SliderControl
              label="Height Start"
              value={tex.heightStart}
              min={0}
              max={1}
              step={0.05}
              onChange={(value) =>
                setTexture({ slotId: idx as 0 | 1 | 2, updates: { heightStart: value } })
              }
            />
            <SliderControl
              label="Height End"
              value={tex.heightEnd}
              min={0}
              max={1}
              step={0.05}
              onChange={(value) =>
                setTexture({ slotId: idx as 0 | 1 | 2, updates: { heightEnd: value } })
              }
            />
            <SliderControl
              label="Slope Influence"
              value={tex.slopeInfluence}
              min={0}
              max={1}
              step={0.05}
              onChange={(value) =>
                setTexture({ slotId: idx as 0 | 1 | 2, updates: { slopeInfluence: value } })
              }
            />
          </SectionPanel>
        ))}
      </div>

      {/* Keyboard hints */}
      <div className="p-2 border-t border-gray-700 text-xs text-gray-500 text-center">
        W: Wireframe | R: Reset
      </div>
    </div>
  )
}
