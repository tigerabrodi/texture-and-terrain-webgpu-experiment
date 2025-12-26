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
  const setNoise = useTerrainStore((state) => state.setNoise)
  const setTerrainSize = useTerrainStore((state) => state.setTerrainSize)
  const setRender = useTerrainStore((state) => state.setRender)
  const resetToDefaults = useTerrainStore((state) => state.resetToDefaults)

  // Handle resolution slider with discrete power-of-2 steps
  const handleResolutionChange = (value: number) => {
    const resolution = findClosestResolution(value)
    setTerrainSize({ resolution })
  }

  return (
    <div className="fixed left-4 top-4 bottom-4 w-[280px] bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-white font-semibold">Controls</h2>
        <button
          type="button"
          onClick={resetToDefaults}
          className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          Reset
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
            label="Wireframe"
            checked={render.wireframe}
            onChange={(checked) => setRender({ wireframe: checked })}
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
      </div>
    </div>
  )
}
