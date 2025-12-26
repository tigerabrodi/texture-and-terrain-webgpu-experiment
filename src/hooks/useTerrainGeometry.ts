import { useEffect, useMemo } from 'react'
import { BufferGeometry, BufferAttribute } from 'three'
import { useTerrainStore } from '../stores/terrainStore'
import { generateHeightmap } from '../lib/terrain/heightmap'
import { calculateNormals } from '../lib/terrain/normals'
import { buildPositions, buildUVs, buildIndices } from '../lib/terrain/geometry'

export function useTerrainGeometry(): BufferGeometry {
  const terrain = useTerrainStore((s) => s.terrain)

  const geometry = useMemo(() => {
    const { resolution, worldSize, noise } = terrain

    // Generate heightmap from noise parameters
    const heightmap = generateHeightmap({
      resolution,
      noise,
    })

    // Build geometry buffers
    const positions = buildPositions({
      heightmap,
      resolution,
      worldSize,
    })

    const normals = calculateNormals({
      heightmap,
      resolution,
      worldSize,
    })

    const uvs = buildUVs({ resolution })
    const indices = buildIndices({ resolution })

    // Create Three.js BufferGeometry
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('normal', new BufferAttribute(normals, 3))
    geo.setAttribute('uv', new BufferAttribute(uvs, 2))
    geo.setIndex(new BufferAttribute(indices, 1))

    return geo
  }, [terrain])

  // Cleanup geometry when it changes or on unmount
  useEffect(() => {
    return () => {
      geometry.dispose()
    }
  }, [geometry])

  return geometry
}
