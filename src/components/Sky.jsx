import { useEffect, useRef } from 'react'
import { SKIES } from '../lib/conditions'

const CLOUDINESS = { clear: 0, partly: 0.45, cloudy: 0.85, fog: 0.6, drizzle: 0.7, rain: 0.8, snow: 0.65, storm: 0.9 }

function useParticles(canvasRef, kind, isDay) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const rainy = kind === 'rain' || kind === 'storm' || kind === 'drizzle'
    const snowy = kind === 'snow'
    const starry = !isDay && (kind === 'clear' || kind === 'partly')
    const area = (w * h) / (1440 * 900)

    const count = rainy ? Math.round((kind === 'drizzle' ? 140 : 320) * area) : snowy ? Math.round(170 * area) : starry ? Math.round(220 * area) : 0
    const parts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 0.8 + 0.2,
      p: Math.random() * Math.PI * 2,
    }))

    let flash = 0
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      if (rainy) {
        ctx.lineCap = 'round'
        for (const d of parts) {
          const len = (kind === 'drizzle' ? 8 : 18) * d.z
          ctx.strokeStyle = `rgba(200, 225, 255, ${0.18 + d.z * 0.35})`
          ctx.lineWidth = d.z * 1.4
          ctx.beginPath()
          ctx.moveTo(d.x, d.y)
          ctx.lineTo(d.x - len * 0.25, d.y + len)
          ctx.stroke()
          if (!reduce) {
            d.y += (kind === 'drizzle' ? 7 : 15) * d.z
            d.x -= 3 * d.z
            if (d.y > h) { d.y = -20; d.x = Math.random() * (w + 100) }
          }
        }
      } else if (snowy) {
        for (const s of parts) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + s.z * 0.55})`
          ctx.beginPath()
          ctx.arc(s.x, s.y, 1 + s.z * 2.6, 0, Math.PI * 2)
          ctx.fill()
          if (!reduce) {
            s.y += 0.5 + s.z * 1.3
            s.x += Math.sin(t / 1400 + s.p) * 0.6
            if (s.y > h + 5) { s.y = -5; s.x = Math.random() * w }
          }
        }
      } else if (starry) {
        for (const s of parts) {
          const tw = reduce ? 0.7 : 0.45 + 0.55 * Math.abs(Math.sin(t / 1600 + s.p))
          ctx.fillStyle = `rgba(255, 255, 255, ${tw * s.z})`
          ctx.beginPath()
          ctx.arc(s.x, s.y * 0.75, s.z * 1.3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (kind === 'storm' && !reduce) {
        if (flash <= 0 && Math.random() < 0.004) flash = 1
        if (flash > 0) {
          ctx.fillStyle = `rgba(220, 230, 255, ${flash * 0.35})`
          ctx.fillRect(0, 0, w, h)
          flash -= 0.06
        }
      }
      if (!reduce && (count > 0 || kind === 'storm')) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, kind, isDay])
}

/** Full-screen living sky: gradient, sun or moon glow, drifting clouds and weather particles. */
export default function Sky({ kind = 'clear', isDay = true }) {
  const canvasRef = useRef(null)
  useParticles(canvasRef, kind, isDay)
  const [a, b, c] = (SKIES[kind] ?? SKIES.clear)[isDay ? 'day' : 'night']
  const clouds = CLOUDINESS[kind] ?? 0.4
  const glow = kind === 'clear' || kind === 'partly'

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="sky-gradient absolute inset-0" style={{ '--sky-a': a, '--sky-b': b, '--sky-c': c }} />

      <div
        className="absolute -right-40 -top-40 h-[42rem] w-[42rem] rounded-full transition-opacity duration-[2000ms]"
        style={{
          opacity: glow ? 1 : 0,
          background: isDay
            ? 'radial-gradient(circle, rgba(255,236,170,0.75) 0%, rgba(255,200,120,0.25) 35%, transparent 65%)'
            : 'radial-gradient(circle, rgba(210,220,255,0.35) 0%, rgba(150,170,255,0.08) 40%, transparent 65%)',
        }}
      />

      <div className="absolute inset-0 transition-opacity duration-[2000ms]" style={{ opacity: clouds }}>
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
      </div>

      {kind === 'fog' && <div className="fog-layer absolute inset-0" />}

      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_40%,rgba(0,0,0,0.35)_100%)]" />
      <div className="noise absolute inset-0 opacity-[0.06] mix-blend-overlay" />
    </div>
  )
}
