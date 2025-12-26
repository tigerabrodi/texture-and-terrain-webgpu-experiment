import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  add,
  clamp,
  div,
  float,
  max,
  mul,
  normalWorld,
  positionWorld,
  smoothstep,
  texture,
  uv,
  vec3,
} from 'three/tsl'
import { MeshStandardNodeMaterial } from 'three/webgpu'
import { useTerrainStore } from '../stores/terrainStore'

// Helper to load a texture
function loadTexture(url: string): THREE.Texture {
  const loader = new THREE.TextureLoader()
  const tex = loader.load(url)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

type MaterialWithTextures = {
  material: MeshStandardNodeMaterial
  textures: THREE.Texture[]
}

export function useTerrainMaterial(): MeshStandardNodeMaterial {
  const textures = useTerrainStore((s) => s.textures)
  const render = useTerrainStore((s) => s.render)
  const terrain = useTerrainStore((s) => s.terrain)

  // Extract values for dependency tracking
  const tex0Url = textures[0].diffuseUrl
  const tex1Url = textures[1].diffuseUrl
  const tex2Url = textures[2].diffuseUrl
  const tex0HeightStart = textures[0].heightStart
  const tex0HeightEnd = textures[0].heightEnd
  const tex0SlopeInfluence = textures[0].slopeInfluence
  const tex1HeightStart = textures[1].heightStart
  const tex1HeightEnd = textures[1].heightEnd
  const tex1SlopeInfluence = textures[1].slopeInfluence
  const tex2HeightStart = textures[2].heightStart
  const tex2HeightEnd = textures[2].heightEnd
  const tex2SlopeInfluence = textures[2].slopeInfluence
  const textureScale = render.textureScale
  const wireframe = render.wireframe
  const worldSize = terrain.worldSize

  const result = useMemo<MaterialWithTextures>(() => {
    // Load all 3 diffuse textures
    const tex0 = loadTexture(tex0Url)
    const tex1 = loadTexture(tex1Url)
    const tex2 = loadTexture(tex2Url)

    // Create the node material
    const mat = new MeshStandardNodeMaterial()
    mat.side = THREE.DoubleSide
    mat.wireframe = wireframe

    // Get world position Y normalized to terrain height
    const worldY = positionWorld.y
    const maxHeight = float(worldSize)
    const normalizedHeight = clamp(div(worldY, maxHeight), 0, 1)

    // Get slope from world normal (0 = flat, 1 = vertical)
    const slope = clamp(add(float(1), mul(normalWorld.y, float(-1))), 0, 1)

    // Texture scale (UV tiling)
    const scale = float(textureScale)
    const scaledUV = mul(uv(), scale)

    // Sample textures (basic UV mapping for now)
    const sample0 = texture(tex0, scaledUV)
    const sample1 = texture(tex1, scaledUV)
    const sample2 = texture(tex2, scaledUV)

    // Height-based weights using smoothstep
    // Calculate height weights with smooth transitions
    const weight0Height = mul(
      smoothstep(
        float(tex0HeightStart),
        float(tex0HeightStart + 0.1),
        normalizedHeight
      ),
      add(
        float(1),
        mul(
          float(-1),
          smoothstep(
            float(tex0HeightEnd - 0.1),
            float(tex0HeightEnd),
            normalizedHeight
          )
        )
      )
    )

    const weight1Height = mul(
      smoothstep(
        float(tex1HeightStart),
        float(tex1HeightStart + 0.1),
        normalizedHeight
      ),
      add(
        float(1),
        mul(
          float(-1),
          smoothstep(
            float(tex1HeightEnd - 0.1),
            float(tex1HeightEnd),
            normalizedHeight
          )
        )
      )
    )

    const weight2Height = mul(
      smoothstep(
        float(tex2HeightStart),
        float(tex2HeightStart + 0.1),
        normalizedHeight
      ),
      add(
        float(1),
        mul(
          float(-1),
          smoothstep(
            float(tex2HeightEnd - 0.1),
            float(tex2HeightEnd),
            normalizedHeight
          )
        )
      )
    )

    // Calculate slope weights (rock shows on steep slopes)
    const slopeThreshold = float(0.3)
    const slopeWeight = smoothstep(slopeThreshold, float(0.6), slope)

    // Combine height and slope weights
    // Rock (tex1) gets boosted by slope
    const slopeInf0 = float(tex0SlopeInfluence)
    const slopeInf1 = float(tex1SlopeInfluence)
    const slopeInf2 = float(tex2SlopeInfluence)

    // Final weights: blend between height-based and slope-boosted
    const w0 = mul(
      weight0Height,
      add(float(1), mul(float(-1), mul(slopeWeight, slopeInf0)))
    )
    const w1 = add(weight1Height, mul(slopeWeight, slopeInf1))
    const w2 = mul(
      weight2Height,
      add(float(1), mul(float(-1), mul(slopeWeight, slopeInf2)))
    )

    // Normalize weights to sum to 1
    const totalWeight = max(add(add(w0, w1), w2), float(0.001))
    const nw0 = div(w0, totalWeight)
    const nw1 = div(w1, totalWeight)
    const nw2 = div(w2, totalWeight)

    // Blend textures using weights
    const blendedColor = add(
      add(mul(sample0, vec3(nw0, nw0, nw0)), mul(sample1, vec3(nw1, nw1, nw1))),
      mul(sample2, vec3(nw2, nw2, nw2))
    )

    // Set the color node
    mat.colorNode = blendedColor

    // Set other material properties
    mat.roughness = 0.8
    mat.metalness = 0.1

    return { material: mat, textures: [tex0, tex1, tex2] }
  }, [
    tex0Url,
    tex1Url,
    tex2Url,
    tex0HeightStart,
    tex0HeightEnd,
    tex0SlopeInfluence,
    tex1HeightStart,
    tex1HeightEnd,
    tex1SlopeInfluence,
    tex2HeightStart,
    tex2HeightEnd,
    tex2SlopeInfluence,
    textureScale,
    wireframe,
    worldSize,
  ])

  // Cleanup on dependency change or unmount
  useEffect(() => {
    return () => {
      result.textures.forEach((t) => t.dispose())
      result.material.dispose()
    }
  }, [result])

  return result.material
}
