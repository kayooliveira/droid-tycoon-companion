import { Info } from '@phosphor-icons/react'
import { useState } from 'react'
import { uiIconProps } from './iconStyle'
import { IconButton } from './IconButton'
import { Modal } from './Modal'

export function HelpHint({
  text,
  label,
  testId = 'help-hint',
}: {
  text: string
  label: string
  testId?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <IconButton
        label={label}
        className="min-h-8 min-w-8"
        data-testid={`${testId}-trigger`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <Info {...uiIconProps} />
      </IconButton>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        testId={`${testId}-modal`}
      >
        <p className="text-sm text-zinc-300 text-pretty" data-testid={`${testId}-body`}>
          {text}
        </p>
      </Modal>
    </>
  )
}
