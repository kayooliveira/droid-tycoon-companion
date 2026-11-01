import { cn } from '../../lib/utils'

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  id?: string
}) {
  const inputId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <label htmlFor={inputId} className="flex items-center justify-between gap-3 min-h-11 cursor-pointer">
      <span className="text-sm text-ui-fg text-pretty">{label}</span>
      <button
        id={inputId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
          checked ? 'bg-holo-600 border-holo-400/40' : 'bg-ui-field-muted border-ui',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  )
}
