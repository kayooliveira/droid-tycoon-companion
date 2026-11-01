import { Info } from '@phosphor-icons/react'
import { useId, useState } from 'react'
import { uiIconProps } from './iconStyle'
import { IconButton } from './IconButton'

export function HelpHint({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span className="relative inline-flex">
      <IconButton
        label={label}
        className="min-h-8 min-w-8"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
      >
        <Info {...uiIconProps} />
      </IconButton>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="help-hint-popover absolute z-50 top-full mt-1 right-0 w-56 rounded-lg border border-white/15 bg-surface-850 p-2 text-xs text-zinc-300 shadow-lg text-pretty"
        >
          {text}
        </span>
      ) : null}
    </span>
  )
}
