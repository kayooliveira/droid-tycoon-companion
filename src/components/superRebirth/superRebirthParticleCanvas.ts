export type ParticlePalette = {
  fills: string[]
  accent: string
  flash: string
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  star: boolean
}

export type SuperRebirthParticleFx = {
  resize: () => void
  ignite: (cx: number, cy: number, strength?: number) => void
  tick: (now: number) => void
  dispose: () => void
}

const POOL = 192

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function createSuperRebirthParticleFx(
  canvas: HTMLCanvasElement,
  palette: ParticlePalette,
): SuperRebirthParticleFx {
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) {
    return { resize: () => {}, ignite: () => {}, tick: () => {}, dispose: () => {} }
  }

  let width = 0
  let height = 0
  let particles: Particle[] = []
  let active = false
  let last = 0

  const resize = () => {
    const parent = canvas.parentElement
    const rect = parent?.getBoundingClientRect() ?? canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    width = Math.max(1, rect.width)
    height = Math.max(1, rect.height)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const ignite = (cx: number, cy: number, strength = 1) => {
    particles = []
    active = true
    const fills = palette.fills.length ? palette.fills : [palette.accent]
    for (let i = 0; i < POOL; i++) {
      const angle = (i / POOL) * Math.PI * 2 + rand(-0.2, 0.2)
      const speed = rand(90, 420) * strength
      const color = fills[i % fills.length]!
      particles.push({
        x: cx + rand(-4, 4),
        y: cy + rand(-4, 4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(1.2, 5.2),
        life: rand(0.85, 1.25),
        maxLife: 1.4,
        color,
        star: Math.random() < 0.14,
      })
    }
  }

  const tick = (now: number) => {
    if (!active) return
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
    last = now

    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'lighter'

    let alive = 0
    for (const p of particles) {
      p.life -= dt * 0.55
      if (p.life <= 0) continue
      alive++
      p.vx *= 0.985
      p.vy = p.vy * 0.985 + 28 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt

      const alpha = Math.min(1, p.life / p.maxLife)
      const radius = p.size * (0.6 + alpha * 0.8)
      ctx.globalAlpha = alpha * 0.92
      ctx.beginPath()
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = radius * 3.2
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fill()
      if (p.star) {
        ctx.shadowBlur = 0
        ctx.globalAlpha = alpha
        ctx.fillStyle = 'rgb(255,255,255)'
        ctx.arc(p.x, p.y, radius * 0.35, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    ctx.shadowBlur = 0
    if (alive === 0) {
      active = false
      ctx.clearRect(0, 0, width, height)
    }
  }

  const dispose = () => {
    active = false
    particles = []
    ctx.clearRect(0, 0, width, height)
  }

  return { resize, ignite, tick, dispose }
}
