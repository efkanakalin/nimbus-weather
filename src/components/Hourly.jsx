import { useId } from 'react'
import WeatherIcon from './WeatherIcon'
import { tempColor } from '../lib/conditions'
import { hourLabel, toUnit } from '../lib/format'

const COL = 68
const CURVE_H = 80

function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}

/** Next 24 hours: a smooth temperature curve over icons and rain chance. */
export default function Hourly({ hours, unit }) {
  const id = useId().replace(/:/g, '')
  const temps = hours.map(h => h.temp)
  const lo = Math.min(...temps)
  const hi = Math.max(...temps)
  const span = Math.max(hi - lo, 1)
  const width = hours.length * COL
  const pts = hours.map((h, i) => [i * COL + COL / 2, 28 + (1 - (h.temp - lo) / span) * (CURVE_H - 40)])
  const line = smoothPath(pts)
  const area = `${line} L ${pts.at(-1)[0]} ${CURVE_H} L ${pts[0][0]} ${CURVE_H} Z`

  return (
    <section className="glass animate-rise rounded-3xl p-5 [animation-delay:80ms]">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="card-title">Next 24 hours</h2>
        <span className="text-xs text-white/55">Scroll →</span>
      </header>

      <div className="scroll-x -mx-5 overflow-x-auto px-5 pb-1">
        <div style={{ width }} className="relative">
          <svg width={width} height={CURVE_H} className="block overflow-visible">
            <defs>
              <linearGradient id={`${id}-stroke`} x1="0" x2="1" y1="0" y2="0">
                {hours.map((h, i) => (
                  <stop key={i} offset={`${(i / (hours.length - 1)) * 100}%`} stopColor={tempColor(h.temp)} />
                ))}
              </linearGradient>
              <linearGradient id={`${id}-fill`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.22" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${id}-fill)`} />
            <path d={line} fill="none" stroke={`url(#${id}-stroke)`} strokeWidth="3" strokeLinecap="round" className="draw-line" />
            {pts.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={i === 0 ? 5 : 3} fill={i === 0 ? 'white' : tempColor(hours[i].temp)} stroke="rgba(0,0,0,.25)" strokeWidth="1" />
                <text x={x} y={y - 10} textAnchor="middle" className="fill-white text-[13px] font-semibold">
                  {Math.round(toUnit(hours[i].temp, unit))}°
                </text>
              </g>
            ))}
          </svg>

          <div className="flex">
            {hours.map((h, i) => (
              <div key={h.time} style={{ width: COL }} className="flex flex-col items-center gap-1.5 pt-2">
                <WeatherIcon code={h.code} isDay={h.isDay} size={34} animated={i < 3} />
                <span className={`text-[11px] font-medium ${h.pop >= 20 ? 'text-sky-200' : 'text-transparent'}`}>
                  {h.pop}%
                </span>
                <span className={`text-xs ${i === 0 ? 'font-semibold text-white' : 'text-white/70'}`}>
                  {i === 0 ? 'Now' : `${hourLabel(h.time)}:00`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
