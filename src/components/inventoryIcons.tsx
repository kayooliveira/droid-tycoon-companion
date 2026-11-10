import type { ReactNode, SVGProps } from 'react'

function DdIc({
  size = 24,
  className = 'ic',
  children,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number; children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export function IcSearch({ size = 20, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.9-4.9" />
    </DdIc>
  )
}

export function IcGridView({ size = 22, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" />
    </DdIc>
  )
}

export function IcListView({ size = 22, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </DdIc>
  )
}

export function IcPlus({ size = 22, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <path d="M12 5v14M5 12h14" />
    </DdIc>
  )
}

export function IcMinus({ size = 22, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <path d="M5 12h14" />
    </DdIc>
  )
}

export function IcTagCheck({ size = 14, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <path d="m4.5 12.5 5 5L19.5 7" />
    </DdIc>
  )
}

export function IcTagX({ size = 14, className = 'ic' }: { size?: number; className?: string }) {
  return (
    <DdIc size={size} className={className}>
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </DdIc>
  )
}
