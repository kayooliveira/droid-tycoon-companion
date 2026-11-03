import { cn } from '../../lib/utils'

export function DeviceFrame({
  srcDark,
  srcLight,
  className,
  tilt,
}: {
  srcDark: string
  srcLight: string
  className?: string
  tilt?: boolean
}) {
  return (
    <div className={cn('ob-device-wrap', tilt && 'ob-device-wrap--tilt', className)}>
      <div className="ob-device-bezel">
        <div className="ob-dynamic-island" aria-hidden />
        <img
          src={srcDark}
          alt=""
          className="ob-device-screen ob-device-screen--dark"
          decoding="async"
        />
        <img
          src={srcLight}
          alt=""
          className="ob-device-screen ob-device-screen--light"
          decoding="async"
        />
      </div>
    </div>
  )
}
