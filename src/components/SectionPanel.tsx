import { useState } from 'react'

type SectionPanelProps = {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function SectionPanel({
  title,
  defaultOpen = true,
  children,
}: SectionPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-1 text-left text-white font-medium hover:bg-gray-800/50 transition-colors"
      >
        <span>{title}</span>
        <span className="text-gray-400 text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && <div className="pb-4 px-1 flex flex-col gap-3">{children}</div>}
    </div>
  )
}
