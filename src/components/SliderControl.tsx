type SliderControlProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: SliderControlProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm text-gray-400 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  )
}
