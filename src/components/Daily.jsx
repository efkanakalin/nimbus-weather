import WeatherIcon from './WeatherIcon'
import { tempColor } from '../lib/conditions'
import { temp, weekday } from '../lib/format'

/** Ten-day outlook with temperature range bars on a shared scale. */
export default function Daily({ days, current, unit }) {
  const lo = Math.min(...days.map(d => d.min))
  const hi = Math.max(...days.map(d => d.max))
  const span = Math.max(hi - lo, 1)
  const pos = (t) => ((t - lo) / span) * 100

  return (
    <section className="glass animate-rise rounded-3xl p-5 [animation-delay:140ms]">
      <h2 className="card-title mb-2">10-day forecast</h2>
      <ul className="divide-y divide-white/10">
        {days.map((d, i) => (
          <li key={d.date} className="grid grid-cols-[3.2rem_2.5rem_2.6rem_2.4rem_1fr_2.4rem] items-center gap-2 py-2.5 sm:gap-3">
            <span className={`text-[15px] ${i === 0 ? 'font-semibold text-white' : 'text-white/85'}`}>
              {i === 0 ? 'Today' : weekday(d.date)}
            </span>
            <WeatherIcon code={d.code} isDay size={30} animated={false} />
            <span className={`text-xs font-medium ${d.pop >= 20 ? 'text-sky-200' : 'text-transparent'}`}>{d.pop}%</span>
            <span className="text-right text-[15px] text-white/60">{temp(d.min, unit)}</span>
            <span className="relative h-[6px] rounded-full bg-black/20">
              <span
                className="absolute inset-y-0 rounded-full"
                style={{
                  left: `${pos(d.min)}%`,
                  right: `${100 - pos(d.max)}%`,
                  background: `linear-gradient(90deg, ${tempColor(d.min)}, ${tempColor(d.max)})`,
                }}
              />
              {i === 0 && (
                <span
                  className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/40 shadow"
                  style={{ left: `${Math.min(Math.max(pos(current.temp), 0), 100)}%` }}
                  title="Now"
                />
              )}
            </span>
            <span className="text-[15px] font-medium text-white">{temp(d.max, unit)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
