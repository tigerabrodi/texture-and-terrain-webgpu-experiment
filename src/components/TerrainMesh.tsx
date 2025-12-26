import { useTerrainGeometry } from '../hooks/useTerrainGeometry'
import { useTerrainMaterial } from '../hooks/useTerrainMaterial'

export function TerrainMesh() {
  const geometry = useTerrainGeometry()
  const material = useTerrainMaterial()

  return <mesh geometry={geometry} material={material} />
}
