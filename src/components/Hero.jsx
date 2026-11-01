import { useEffect, useState } from 'react'
import WeatherIcon from './WeatherIcon'
import { describe } from '../lib/conditions'
import { clock, flag, hourLabel, localNow, temp, toUnit } from '../lib/format'

const liveFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })

function useLocalClock(utcOffset) {
  const [now, setNow] = useState(() => localNow(utcOffset))
  useEffect(() => {
    setNow(localNow(utcOffset))
    const id = setInterval(() => setNow(localNow(utcOffset)), 15000)
    return () => clearInterval(id)
  }, [utcOffset])
  return liveFmt.format(now)
}

/** One-sentence outlook for the next 12 hours, like a forecaster would say it. */
function outlook(data, unit) {
  const next = data.hourly.slice(1, 13)
  const wet = next.find(h => h.pop >= 55)
  const { kind } = describe(data.current.code)
  const wetNow = ['rain', 'drizzle', 'storm', 'snow'].includes(kind)

  if (wetNow) {
    const dry = next.find(h => h.pop < 25 && !['rain', 'drizzle', 'storm', 'snow'].includes(describe(h.code).kind))
    return dry ? `${describe(data.current.code).label} easing off around ${hourLabel(dry.time)}:00.` : `${describe(data.current.code).label} continuing through the next hours.`
  }
  if (wet) {
    const what = describe(wet.code).kind === 'snow' ? 'Snow' : 'Rain'
    return `${what} likely around ${hourLabel(wet.time)}:00 — ${wet.pop}% chance.`
  }
  const later = next.at(-1)
  if (later) {
    const delta = toUnit(later.temp, unit) - toUnit(data.current.temp, unit)
    if (Math.abs(delta) >= 3) return `${delta > 0 ? 'Warming' : 'Cooling'} to ${temp(later.temp, unit)} by ${clock(later.time)}. Dry conditions ahead.`
  }
  return kind === 'clear' ? 'Clear skies and dry conditions for the next 12 hours.' : 'Dry conditions expected for the next 12 hours.'
}

export default function Hero({ place, data, unit }) {
  const { current, daily, utcOffset } = data
  const { label } = describe(current.code)
  const today = daily[0]
  const time = useLocalClock(utcOffset)

  return (
    <section className="animate-rise relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <span className="text-base leading-none">{flag(place.countryCode)}</span>
          <span className="truncate">{[place.region, place.country].filter(Boolean).join(', ')}</span>
        </div>
        <h1 className="mt-1 truncate font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
          {place.name}
        </h1>
        <p className="mt-2 text-sm text-white/70">{time}</p>

        <div className="mt-6 flex items-center gap-4 sm:gap-6">
          <span className="temp-display font-display text-[7.5rem] font-extralight leading-[0.85] tracking-[-0.06em] text-white sm:text-[9.5rem]">
            {Math.round(toUnit(current.temp, unit))}
            <span className="align-top text-[0.42em] font-light tracking-normal text-white/80">°{unit}</span>
          </span>
          <WeatherIcon code={current.code} isDay={current.isDay} size={112} className="hidden shrink-0 sm:block" />
        </div>
      </div>

      <div className="glass max-w-sm rounded-3xl p-5 md:mb-3">
        <div className="flex items-center gap-3">
          <WeatherIcon code={current.code} isDay={current.isDay} size={44} className="sm:hidden" />
          <div>
            <p className="text-xl font-medium text-white">{label}</p>
            <p className="text-sm text-white/70">
              H {temp(today.max, unit)} · L {temp(today.min, unit)} · Feels {temp(current.feels, unit)}
            </p>
          </div>
        </div>
        <p className="mt-3 border-t border-white/15 pt-3 text-[15px] leading-relaxed text-white/90">{outlook(data, unit)}</p>
      </div>
    </section>
  )
}
