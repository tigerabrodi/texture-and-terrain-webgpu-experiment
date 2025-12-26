import { useState } from 'react'
import type { TextureSlot as TextureSlotType } from '../types'
import { useTextureLoader } from '../hooks/useTextureLoader'

type TextureSlotProps = {
  slot: TextureSlotType
  onTextureChange: (newUrl: string) => void
}

export function TextureSlot({ slot, onTextureChange }: TextureSlotProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { pickTexture } = useTextureLoader()

  const handleClick = async () => {
    const newUrl = await pickTexture()
    if (newUrl) {
      onTextureChange(newUrl)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative flex flex-col items-center gap-2 p-2 rounded-lg
        transition-all duration-200 cursor-pointer
        bg-gray-800/50 hover:bg-gray-700/50
        ${isHovered ? 'border-blue-500 ring-1 ring-blue-500/50' : 'border-gray-600'}
        border
      `}
    >
      {/* Texture thumbnail */}
      <div className="relative w-20 h-20 rounded-md overflow-hidden">
        <img
          src={slot.diffuseUrl}
          alt={slot.name}
          className="w-full h-full object-cover"
        />

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-xs text-white text-center px-1 font-medium">
              Click to replace
            </span>
          </div>
        )}
      </div>

      {/* Texture name */}
      <span className="text-xs text-gray-300 font-medium truncate max-w-[80px]">
        {slot.name}
      </span>
    </button>
  )
}
