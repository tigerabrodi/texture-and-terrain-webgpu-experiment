# Terrain Playground

A real-time procedural terrain generator built with WebGPU, React Three Fiber, and TSL (Three Shading Language). Generate infinite variations of terrain with customizable noise parameters and texture blending.

## Features

- **Procedural Generation** - Perlin noise with Fractal Brownian Motion (FBM) for natural-looking terrain
- **Real-time Controls** - Tweak every parameter and see changes instantly
- **Texture Splatting** - Height and slope-based blending between 3 texture layers
- **Custom Textures** - Click any texture slot to upload your own
- **WebGPU Rendering** - Modern GPU-accelerated rendering with TSL shaders

## Quick Start

```bash
bun install
bun dev
```

Open http://localhost:5173 in a WebGPU-capable browser (Chrome 113+, Edge 113+).

## Controls

### Keyboard

- `W` - Toggle wireframe
- `R` - Reset to defaults

### Mouse

- **Left drag** - Orbit camera
- **Right drag** - Pan camera
- **Scroll** - Zoom

### Parameters

| Section           | Control          | Description                                     |
| ----------------- | ---------------- | ----------------------------------------------- |
| **Terrain**       | World Size       | Physical size of the terrain                    |
|                   | Resolution       | Vertex density (32-512)                         |
| **Noise**         | Seed             | Random seed for reproducible terrain            |
|                   | Frequency        | Base noise frequency (lower = broader features) |
|                   | Amplitude        | Height multiplier                               |
|                   | Octaves          | Layers of detail (1-8)                          |
|                   | Lacunarity       | Frequency multiplier per octave                 |
|                   | Persistence      | Amplitude multiplier per octave                 |
| **Render**        | Wireframe        | Show mesh wireframe                             |
|                   | Texture Scale    | UV tiling scale                                 |
| **Texture Blend** | Height Start/End | Height range for texture visibility             |
|                   | Slope Influence  | How much slope affects blending                 |

## Architecture

```
src/
├── lib/                    # Pure functions (TDD tested)
│   ├── noise/              # Perlin, FBM, permutation tables
│   ├── terrain/            # Heightmap, normals, geometry builders
│   ├── splatting/          # Slope calc, weight blending
│   └── texture/            # Normal map generation
├── hooks/
│   ├── useTerrainGeometry  # Generates BufferGeometry from noise
│   └── useTerrainMaterial  # TSL shader for texture splatting
├── stores/
│   └── terrainStore        # Zustand state management
└── components/             # React UI components
```

## Tech Stack

- **Bun** - Runtime & package manager
- **Vite** - Build tool
- **React** + **TypeScript**
- **Three.js** with **WebGPU** renderer
- **React Three Fiber** v9
- **TSL** (Three Shading Language) - Type-safe shader nodes
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vitest** - Testing (41 tests for lib functions)

## How It Works

1. **Noise Generation** - A seeded permutation table feeds into 2D Perlin noise, layered with FBM for detail
2. **Geometry Building** - Heightmap → vertex positions, normals, UVs, and triangle indices
3. **Texture Splatting** - TSL shader blends 3 textures based on world-space height and surface slope
4. **Real-time Updates** - Zustand store triggers geometry/material rebuilds on parameter changes

## Browser Support

Requires WebGPU support:

- Chrome 113+
- Edge 113+
- Firefox (behind flag)
- Safari 18+ (macOS Sequoia)

## License

MIT
