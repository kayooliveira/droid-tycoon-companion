import type { ComponentProps } from 'react'
import { Badge } from './Badge'

/** Compact label chip; alias of Badge with chip sizing defaults. */
export function Chip(props: ComponentProps<typeof Badge>) {
  return <Badge {...props} className={`text-ds-xs ${props.className ?? ''}`} />
}
