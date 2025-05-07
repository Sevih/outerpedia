'use client'

type Props = {
    versions: Record<string, { label: string }>
    selected: string
    onSelect: (key: string) => void
  }
  

export default function VersionSelector({ versions, selected, onSelect }: Props) {
  return (
    <div className="mb-4">
      <label className="text-neutral-400 text-sm mr-2">Guide version:</label>
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-neutral-800 text-white border border-neutral-600 px-2 py-1 rounded"
      >
        {Object.entries(versions).map(([key, v]) => (
          <option key={key} value={key}>
            {v.label}
          </option>
        ))}
      </select>
    </div>
  )
}
