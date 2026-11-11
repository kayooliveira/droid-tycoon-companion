import type { ReactNode } from 'react'
import { IcTagCheck, IcTagX } from '../inventoryIcons'

type TagKind = 'ok' | 'bad' | 'mute'

function IcTagPlus({ size = 14, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

/** Matches `tag()` in dd-design/sistema/tools/ui.py (tag-sq + theme icon + label). */
export function DesignSystemTag({ kind, children }: { kind: TagKind; children: ReactNode }) {
  const Icon = kind === 'ok' ? IcTagCheck : kind === 'bad' ? IcTagX : IcTagPlus
  return (
    <span className={`tag tag--${kind}`}>
      <i className="tag-sq" aria-hidden />
      <Icon />
      {children}
    </span>
  )
}
