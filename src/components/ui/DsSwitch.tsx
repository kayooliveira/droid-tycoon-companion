export function DsSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="switch-row">
      <span>
        <span style={{ display: 'block' }}>{label}</span>
      </span>
      <span className="switch">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          aria-label={label}
          onChange={(e) => onChange(e.target.checked)}
        />
        <i aria-hidden />
      </span>
    </label>
  )
}
