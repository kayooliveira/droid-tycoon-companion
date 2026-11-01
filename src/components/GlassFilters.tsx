/** SVG liquid-glass backdrop (Chromium); Safari uses CSS fallback via .glass-refraction-fallback */
export function GlassFilters() {
  const edgeMap = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="68%">
          <stop offset="0%" stop-color="#909090"/>
          <stop offset="45%" stop-color="#808080"/>
          <stop offset="100%" stop-color="#101010"/>
        </radialGradient>
      </defs>
      <rect width="200" height="80" rx="40" fill="url(#g)"/>
    </svg>`,
  )}`

  return (
    <svg
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="lg-nav" x="-35%" y="-45%" width="170%" height="190%" colorInterpolationFilters="sRGB">
          <feImage href={edgeMap} result="dispMap" preserveAspectRatio="none" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.25" result="sharp" />
          <feDisplacementMap in="sharp" in2="dispMap" scale="42" xChannelSelector="R" yChannelSelector="G" result="warp" />
          <feOffset in="warp" dx="-1.2" dy="0" result="rShift" />
          <feOffset in="warp" dx="1.2" dy="0" result="bShift" />
          <feColorMatrix in="rShift" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feColorMatrix in="bShift" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feBlend in="r" in2="warp" mode="screen" result="rb" />
          <feBlend in="b" in2="rb" mode="screen" />
        </filter>
        <filter id="lg" x="-25%" y="-35%" width="150%" height="170%" colorInterpolationFilters="sRGB">
          <feImage href={edgeMap} result="dispMap" preserveAspectRatio="none" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="sharp" />
          <feDisplacementMap in="sharp" in2="dispMap" scale="14" xChannelSelector="R" yChannelSelector="G" result="warp" />
          <feOffset in="warp" dx="-0.6" dy="0" result="rShift" />
          <feOffset in="warp" dx="0.6" dy="0" result="bShift" />
          <feColorMatrix in="rShift" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feColorMatrix in="bShift" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feBlend in="r" in2="warp" mode="screen" result="rb" />
          <feBlend in="b" in2="rb" mode="screen" />
        </filter>
        <filter id="lg-lens" x="-30%" y="-40%" width="160%" height="180%" colorInterpolationFilters="sRGB">
          <feImage href={edgeMap} result="dispMap" preserveAspectRatio="none" />
          <feDisplacementMap in="SourceGraphic" in2="dispMap" scale="22" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="glass-refraction" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}
