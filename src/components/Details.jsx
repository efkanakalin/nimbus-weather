import { aqiInfo, uvInfo } from '../lib/conditions'
import { clock, compass, distance, localNow, parseLocal, temp, toUnit, windSpeed } from '../lib/format'

const ICONS = {
  wind: 'M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8',
  air: 'M4 14a4 4 0 0 1 4-4h.3A6 6 0 0 1 20 11a3.5 3.5 0 0 1-.5 7H8a4 4 0 0 1-4-4z',
  uv: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  sun: 'M12 2v4M4.9 9.9 2 7M19.1 9.9 22 7M2 18h20M6 18a6 6 0 0 1 12 0',
  drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  thermo: 'M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0z',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  gauge: 'M12 13l4-4M3.3 17a10 10 0 1 1 17.4 0',
}

function Card({ icon, title, children, className = '', delay = 0 }) {
  return (
    <section
      className={`glass animate-rise flex flex-col rounded-3xl p-5 ${className}`}
      style={{ animationDelay: `${200 + delay}ms` }}
    >
      <h2 className="card-title mb-3 flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={ICONS[icon]} />
        </svg>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Wind({ c, unit, delay }) {
  return (
    <Card icon="wind" title="Wind" delay={delay}>
      <div className="flex flex-1 items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
            {Array.from({ length: 36 }, (_, i) => {
              const a = (i * 10 * Math.PI) / 180
              const long = i % 9 === 0
              return (
                <line
                  key={i}
                  x1={50 + Math.sin(a) * 44}
                  y1={50 - Math.cos(a) * 44}
                  x2={50 + Math.sin(a) * (long ? 36 : 40)}
                  y2={50 - Math.cos(a) * (long ? 36 : 40)}
                  stroke={long ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.3)'}
                  strokeWidth={long ? 2 : 1}
                />
              )
            })}
            {['N', 'E', 'S', 'W'].map((d, i) => (
              <text key={d} x={50 + Math.sin((i * Math.PI) / 2) * 27} y={54 - Math.cos((i * Math.PI) / 2) * 27} textAnchor="middle" className="fill-white/70 text-[10px] font-semibold">
                {d}
              </text>
            ))}
            <g className="wind-needle" style={{ transform: `rotate(${(c.windDir + 180) % 360}deg)`, transformOrigin: '50px 50px' }}>
              <path d="M50 14 L55 50 L50 46 L45 50 Z" fill="white" />
              <path d="M50 86 L55 50 L50 54 L45 50 Z" fill="rgba(255,255,255,.35)" />
            </g>
            <circle cx="50" cy="50" r="4" fill="white" />
          </svg>
        </div>
        <div className="space-y-2">
          <p>
            <span className="text-3xl font-light text-white">{windSpeed(c.windSpeed, unit).split(' ')[0]}</span>
            <span className="ml-1 text-sm text-white/70">{windSpeed(c.windSpeed, unit).split(' ')[1]}</span>
          </p>
          <p className="text-sm text-white/70">Gusts {windSpeed(c.windGusts, unit)}</p>
          <p className="text-sm text-white/70">From {compass(c.windDir)} · {Math.round(c.windDir)}°</p>
        </div>
      </div>
    </Card>
  )
}

function Air({ air, delay }) {
  const info = aqiInfo(air?.aqi)
  const value = air?.aqi ?? 0
  const pct = Math.min(value / 300, 1)
  const angle = Math.PI * (1 - pct)
  const r = 40
  return (
    <Card icon="air" title="Air quality" delay={delay}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <svg viewBox="0 0 100 58" className="w-40">
          <defs>
            <linearGradient id="aqi-grad" x1="0" x2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="33%" stopColor="#facc15" />
              <stop offset="55%" stopColor="#fb923c" />
              <stop offset="75%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="8" strokeLinecap="round" />
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="url(#aqi-grad)" strokeWidth="8" strokeLinecap="round" opacity=".9" />
          {air && (
            <circle cx={50 + Math.cos(angle) * r} cy={50 - Math.sin(angle) * r} r="5.5" fill="white" stroke={info.color} strokeWidth="2.5" />
          )}
          <text x="50" y="46" textAnchor="middle" className="fill-white text-[20px] font-light">{air?.aqi ?? '—'}</text>
        </svg>
        <p className="mt-1 font-medium" style={{ color: info.color }}>{info.label}</p>
        <p className="mt-1 text-center text-xs text-white/65">{info.advice}</p>
        {air && (
          <div className="mt-3 grid w-full grid-cols-3 gap-2 text-center text-[11px] text-white/60">
            <span><b className="block text-sm font-medium text-white">{Math.round(air.pm25)}</b>PM2.5</span>
            <span><b className="block text-sm font-medium text-white">{Math.round(air.pm10)}</b>PM10</span>
            <span><b className="block text-sm font-medium text-white">{Math.round(air.o3)}</b>O₃</span>
          </div>
        )}
      </div>
    </Card>
  )
}

function Sun({ today, utcOffset, delay }) {
  const rise = parseLocal(today.sunrise).getTime()
  const set = parseLocal(today.sunset).getTime()
  const now = localNow(utcOffset).getTime()
  const t = Math.min(Math.max((now - rise) / (set - rise), 0), 1)
  const up = now > rise && now < set
  const angle = Math.PI * (1 - t)
  const dayLength = (set - rise) / 3600000
  const hours = Math.floor(dayLength)
  const minutes = Math.round((dayLength - hours) * 60)

  return (
    <Card icon="sun" title="Sunrise & sunset" delay={delay}>
      <div className="flex flex-1 flex-col justify-between">
        <svg viewBox="0 0 120 64" className="w-full">
          <defs>
            <linearGradient id="sun-arc" x1="0" x2="1">
              <stop offset="0%" stopColor="#ffb86b" />
              <stop offset="50%" stopColor="#ffe08a" />
              <stop offset="100%" stopColor="#ff8f6b" />
            </linearGradient>
            <clipPath id="sun-done">
              <rect x="0" y="0" width={60 - 50 * Math.cos(Math.PI * t)} height="64" />
            </clipPath>
          </defs>
          <line x1="4" y1="56" x2="116" y2="56" stroke="rgba(255,255,255,.3)" strokeWidth="1" />
          <path d="M10 56 A50 50 0 0 1 110 56" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" strokeDasharray="3 4" />
          <path d="M10 56 A50 50 0 0 1 110 56" fill="none" stroke="url(#sun-arc)" strokeWidth="2.5" clipPath="url(#sun-done)" />
          {up && (
            <g>
              <circle cx={60 + Math.cos(angle) * 50} cy={56 - Math.sin(angle) * 50} r="9" fill="#ffd34d" opacity=".25" />
              <circle cx={60 + Math.cos(angle) * 50} cy={56 - Math.sin(angle) * 50} r="5" fill="#ffd34d" />
            </g>
          )}
        </svg>
        <div className="mt-2 flex justify-between text-sm">
          <div>
            <p className="text-white/60">Sunrise</p>
            <p className="text-lg font-light text-white">{clock(today.sunrise)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60">Sunset</p>
            <p className="text-lg font-light text-white">{clock(today.sunset)}</p>
          </div>
        </div>
        <p className="mt-1 text-xs text-white/60">{hours} h {minutes} min of daylight</p>
      </div>
    </Card>
  )
}

function Uv({ c, today, delay }) {
  const uv = c.uv ?? 0
  const info = uvInfo(uv)
  return (
    <Card icon="uv" title="UV index" delay={delay}>
      <p className="text-4xl font-light text-white">{Math.round(uv)}</p>
      <p className="font-medium text-white">{info.label}</p>
      <div className="relative mt-4 h-[6px] rounded-full bg-[linear-gradient(90deg,#4ade80,#facc15,#fb923c,#f87171,#a855f7)]">
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/40"
          style={{ left: `${Math.min(uv / 11, 1) * 100}%` }}
        />
      </div>
      <p className="mt-auto pt-3 text-xs text-white/65">{info.advice} Peak today {Math.round(today.uvMax ?? 0)}.</p>
    </Card>
  )
}

function Stat({ icon, title, value, sub, delay }) {
  return (
    <Card icon={icon} title={title} delay={delay}>
      <p className="text-4xl font-light text-white">{value}</p>
      <p className="mt-auto pt-3 text-xs leading-relaxed text-white/65">{sub}</p>
    </Card>
  )
}

export default function Details({ data, air, unit }) {
  const c = data.current
  const today = data.daily[0]
  const feelsDiff = toUnit(c.feels, unit) - toUnit(c.temp, unit)
  const feelsText =
    Math.abs(feelsDiff) < 1.5
      ? 'Similar to the actual temperature.'
      : feelsDiff < 0
        ? c.windSpeed > 15 ? 'Wind is making it feel colder.' : 'Feels cooler than the actual temperature.'
        : c.humidity > 60 ? 'Humidity is making it feel warmer.' : 'Feels warmer than the actual temperature.'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Wind c={c} unit={unit} delay={0} />
      <Air air={air} delay={40} />
      <Sun today={today} utcOffset={data.utcOffset} delay={80} />
      <Uv c={c} today={today} delay={120} />
      <Stat icon="thermo" title="Feels like" value={temp(c.feels, unit)} sub={feelsText} delay={160} />
      <Stat
        icon="drop"
        title="Humidity"
        value={`${Math.round(c.humidity)}%`}
        sub={`The dew point is ${temp(c.dewPoint, unit)} right now.`}
        delay={200}
      />
      <Stat
        icon="eye"
        title="Visibility"
        value={distance(c.visibility, unit)}
        sub={c.visibility >= 10000 ? 'Perfectly clear view.' : c.visibility >= 4000 ? 'Slightly hazy.' : 'Low visibility — take care on the road.'}
        delay={240}
      />
      <Stat
        icon="gauge"
        title="Pressure"
        value={unit === 'F' ? `${(c.pressure * 0.02953).toFixed(2)}` : `${Math.round(c.pressure)}`}
        sub={`${unit === 'F' ? 'inHg' : 'hPa'} · ${c.pressure < 1005 ? 'Low pressure, unsettled weather.' : c.pressure > 1020 ? 'High pressure, settled weather.' : 'Normal pressure.'} Rain today ${today.rain.toFixed(1)} mm.`}
        delay={280}
      />
    </div>
  )
}
