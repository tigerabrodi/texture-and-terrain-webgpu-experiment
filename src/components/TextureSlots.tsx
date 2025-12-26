import { useTerrainStore } from '../stores/terrainStore'
import { TextureSlot } from './TextureSlot'

export function TextureSlots() {
  const textures = useTerrainStore((s) => s.textures)
  const setTexture = useTerrainStore((s) => s.setTexture)

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl">
        {textures.map((slot) => (
          <TextureSlot
            key={slot.id}
            slot={slot}
            onTextureChange={(newUrl) => {
              setTexture({
                slotId: slot.id,
                updates: { diffuseUrl: newUrl },
              })
            }}
          />
        ))}
      </div>
    </div>
  )
}
