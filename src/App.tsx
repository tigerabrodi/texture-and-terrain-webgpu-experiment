import { WebGPUCanvas } from './components/WebGPUCanvas'
import { TerrainMesh } from './components/TerrainMesh'
import { ControlPanel } from './components/ControlPanel'
import { TextureSlots } from './components/TextureSlots'

function App() {
  return (
    <div className="h-screen w-screen bg-gray-950">
      <WebGPUCanvas>
        <TerrainMesh />
      </WebGPUCanvas>
      <ControlPanel />
      <TextureSlots />
    </div>
  )
}

export default App
