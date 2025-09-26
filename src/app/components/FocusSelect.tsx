// FocusSelect.tsx
'use client'
import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'

export type Opt = { slug: string; name: string }

export default function FocusSelect({
  options,
  value,
  onChange,
  disabled,
  error,
  placeholder = '— Choose focus —',
}: {
  options: Opt[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  error?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-300">
        Focus (3★)
      </label>

      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          className={[
            'w-full inline-flex items-center justify-between rounded-md px-3 py-2',
            'bg-neutral-900 text-neutral-100',
            'border focus:outline-none focus:ring-2',
            error ? 'border-red-600 focus:ring-red-600' : 'border-neutral-700 focus:ring-blue-600',
            disabled ? 'opacity-60 cursor-not-allowed' : ''
          ].join(' ')}
          aria-label="Focus"
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            className="z-50 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 shadow-xl"
          >
            <Select.ScrollUpButton className="px-2 py-1 text-neutral-400">▲</Select.ScrollUpButton>
            <Select.Viewport className="max-h-72 w-[var(--radix-select-trigger-width)] p-1">
              <Select.Group>
                <Select.Label className="px-2 py-1 text-xs text-neutral-400">— Choose focus —</Select.Label>
                {options.map((o) => (
                  <Select.Item
                    key={o.slug}
                    value={o.slug}
                    className="relative flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm
                               text-neutral-100 outline-none data-[highlighted]:bg-neutral-800"
                  >
                    <Select.ItemIndicator className="absolute left-2">
                      <Check className="h-4 w-4" />
                    </Select.ItemIndicator>
                    <Select.ItemText>{o.name}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Viewport>
            <Select.ScrollDownButton className="px-2 py-1 text-neutral-400">▼</Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
