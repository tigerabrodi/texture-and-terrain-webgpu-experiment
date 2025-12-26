import { useTerrainGeometry } from '../hooks/useTerrainGeometry'
import { useTerrainStore } from '../stores/terrainStore'

export function TerrainMesh() {
  const geometry = useTerrainGeometry()
  const wireframe = useTerrainStore((s) => s.render.wireframe)

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#4a7c4e"
        wireframe={wireframe}
        flatShading={false}
      />
    </mesh>
  )
}
