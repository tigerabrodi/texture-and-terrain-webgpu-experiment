import { Canvas, extend, type ThreeToJSXElements } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three/webgpu'
import WebGPU from 'three/examples/jsm/capabilities/WebGPU.js'
import type { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import type { ReactNode } from 'react'

// Module augmentation for R3F to recognize three/webgpu components
// This is the official pattern from R3F v9 migration guide
declare module '@react-three/fiber' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}

// Extend R3F with three/webgpu module
// The `as any` is intentional - R3F types don't perfectly match three/webgpu yet
// See: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide
// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

type WebGPUCanvasProps = {
  children: ReactNode
}

export function WebGPUCanvas({ children }: WebGPUCanvasProps) {
  if (!WebGPU.isAvailable()) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">WebGPU Not Available</h2>
          <p className="text-gray-400">
            Your browser does not support WebGPU.
            <br />
            Please use Chrome 113+ or Edge 113+.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Canvas
      gl={async (props) => {
        // Cast props to WebGPURendererParameters - this is the official pattern
        // R3F's DefaultGLProps is typed for WebGL, but WebGPURenderer accepts similar props
        // See: https://blog.pragmattic.dev/react-three-fiber-webgpu-typescript
        const renderer = new THREE.WebGPURenderer(props as WebGPURendererParameters)
        await renderer.init()
        return renderer
      }}
      camera={{ position: [100, 100, 100], fov: 60 }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} />
      <OrbitControls makeDefault />
      {children}
    </Canvas>
  )
}
