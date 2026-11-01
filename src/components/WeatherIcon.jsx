import { useId } from 'react'
import { describe } from '../lib/conditions'

function Sun({ id, x = 32, y = 32, r = 11, animated }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-sun`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="55%" stopColor="#ffd34d" />
          <stop offset="100%" stopColor="#ff9f1c" />
        </radialGradient>
      </defs>
      <g className={animated ? 'icon-spin' : undefined}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          return (
            <line
              key={i}
              x1={x + Math.cos(a) * (r + 4)}
              y1={y + Math.sin(a) * (r + 4)}
              x2={x + Math.cos(a) * (r + 9)}
              y2={y + Math.sin(a) * (r + 9)}
              stroke="#ffc93c"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )
        })}
      </g>
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-sun)`} />
    </g>
  )
}

function Moon({ id, x = 34, y = 28, animated }) {
  return (
    <g className={animated ? 'icon-float-slow' : undefined}>
      <defs>
        <linearGradient id={`${id}-moon`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdfcf0" />
          <stop offset="100%" stopColor="#c9d2f5" />
        </linearGradient>
        <mask id={`${id}-moon-mask`}>
          <rect width="64" height="64" fill="white" />
          <circle cx={x + 7} cy={y - 6} r="11" fill="black" />
        </mask>
      </defs>
      <circle cx={x} cy={y} r="12" fill={`url(#${id}-moon)`} mask={`url(#${id}-moon-mask)`} />
      <circle cx={x - 15} cy={y - 12} r="1.2" fill="#fff" opacity=".8" className={animated ? 'icon-twinkle' : undefined} />
      <circle cx={x + 12} cy={y + 14} r="1" fill="#fff" opacity=".6" className={animated ? 'icon-twinkle delay' : undefined} />
    </g>
  )
}

function Cloud({ id, dark, x = 0, y = 0, scale = 1, animated }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <linearGradient id={`${id}-cloud${dark ? 'd' : ''}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dark ? '#c3cad8' : '#ffffff'} />
          <stop offset="100%" stopColor={dark ? '#7d879c' : '#d6e2f2'} />
        </linearGradient>
      </defs>
      <g className={animated ? 'icon-drift' : undefined}>
        <path
          d="M18 48h28a10 10 0 0 0 1.6-19.9A14 14 0 0 0 21.3 25 11.5 11.5 0 0 0 18 48z"
          fill={`url(#${id}-cloud${dark ? 'd' : ''})`}
        />
      </g>
    </g>
  )
}

function Drops({ snow, animated }) {
  const xs = [22, 32, 42]
  return (
    <g>
      {xs.map((x, i) =>
        snow ? (
          <g key={x} transform={`translate(${x} 55)`}>
            <g
              className={animated ? 'icon-snow' : undefined}
              style={{ animationDelay: `${i * 0.45}s` }}
              stroke="#f1f7ff"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <line x1="0" y1="-3.5" x2="0" y2="3.5" />
              <line x1="-3" y1="-1.8" x2="3" y2="1.8" />
              <line x1="-3" y1="1.8" x2="3" y2="-1.8" />
            </g>
          </g>
        ) : (
          <line
            key={x}
            x1={x}
            y1={51}
            x2={x - 3}
            y2={59}
            stroke="#7cc4ff"
            strokeWidth="2.6"
            strokeLinecap="round"
            className={animated ? 'icon-rain' : undefined}
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ),
      )}
    </g>
  )
}

function Bolt({ animated }) {
  return (
    <path
      d="M33 44l-6 10h6l-3 9 10-13h-6l3-6z"
      fill="#ffd43b"
      stroke="#f59f00"
      strokeWidth=".8"
      strokeLinejoin="round"
      className={animated ? 'icon-flash' : undefined}
    />
  )
}

function Fog({ animated }) {
  return (
    <g stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" opacity=".9">
      <line x1="14" y1="40" x2="50" y2="40" className={animated ? 'icon-drift' : undefined} />
      <line x1="10" y1="48" x2="44" y2="48" className={animated ? 'icon-drift reverse' : undefined} />
      <line x1="18" y1="56" x2="54" y2="56" className={animated ? 'icon-drift' : undefined} />
    </g>
  )
}

/** Hand-drawn animated weather glyph for a WMO code, day or night. */
export default function WeatherIcon({ code, isDay = true, size = 48, animated = true, className = '' }) {
  const id = useId().replace(/:/g, '')
  const { kind, label } = describe(code)
  const celestial = isDay ? <Sun id={id} animated={animated} /> : <Moon id={id} animated={animated} />

  let art
  switch (kind) {
    case 'clear':
      art = isDay ? <Sun id={id} r={13} animated={animated} /> : <Moon id={id} x={32} y={32} animated={animated} />
      break
    case 'partly':
      art = (
        <>
          <g transform="translate(-8 -9)">{celestial}</g>
          <Cloud id={id} x={4} y={4} animated={animated} />
        </>
      )
      break
    case 'cloudy':
      art = (
        <>
          <Cloud id={id} dark x={-8} y={-6} scale={0.85} animated={animated} />
          <Cloud id={id} x={4} y={4} animated={animated} />
        </>
      )
      break
    case 'fog':
      art = (
        <>
          <Cloud id={id} x={2} y={-10} animated={animated} />
          <Fog animated={animated} />
        </>
      )
      break
    case 'drizzle':
    case 'rain':
      art = (
        <>
          <Cloud id={id} dark={kind === 'rain'} x={0} y={-6} animated={animated} />
          <Drops animated={animated} />
        </>
      )
      break
    case 'snow':
      art = (
        <>
          <Cloud id={id} x={0} y={-6} animated={animated} />
          <Drops snow animated={animated} />
        </>
      )
      break
    case 'storm':
      art = (
        <>
          <Cloud id={id} dark x={0} y={-8} animated={animated} />
          <Bolt animated={animated} />
        </>
      )
      break
    default:
      art = <Cloud id={id} x={2} y={2} animated={animated} />
  }

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className={`overflow-visible drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)] ${className}`}
    >
      {art}
    </svg>
  )
}
