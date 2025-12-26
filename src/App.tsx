import { WebGPUCanvas } from './components/WebGPUCanvas'
import { TerrainMesh } from './components/TerrainMesh'

function App() {
  return (
    <div className="h-screen w-screen">
      <WebGPUCanvas>
        <TerrainMesh />
      </WebGPUCanvas>
    </div>
  )
}

export default App
