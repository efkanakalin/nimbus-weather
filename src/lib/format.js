export const flag = (cc) =>
  cc && cc.length === 2
    ? String.fromCodePoint(...[...cc.toUpperCase()].map(ch => 0x1f1a5 + ch.charCodeAt(0)))
    : '🌐'

export const toUnit =(c, unit) => (unit === 'F' ? c * 9 / 5 + 32 : c)

export const temp = (c, unit) => (c == null ? '—' : `${Math.round(toUnit(c, unit))}°`)

/** Open-Meteo returns local wall-clock strings ("2026-11-01T09:30"); read them without a time zone shift. */
export function parseLocal(iso) {
  const [d, t = '00:00'] = iso.split('T')
  const [y, m, day] = d.split('-').map(Number)
  const [h, min] = t.split(':').map(Number)
  return new Date(Date.UTC(y, m - 1, day, h, min))
}

const fmt = (opts) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts })
const hourFmt = fmt({ hour: '2-digit', minute: '2-digit', hour12: false })
const weekdayFmt = fmt({ weekday: 'short' })
const longDateFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long' })

export const clock = (iso) => hourFmt.format(parseLocal(iso))
export const hourLabel = (iso) => clock(iso).slice(0, 2)
export const weekday = (iso) => weekdayFmt.format(parseLocal(iso))
export const longDate = (iso) => longDateFmt.format(parseLocal(iso))

/** Current wall-clock time at a place, from its UTC offset. */
export function localNow(utcOffsetSeconds) {
  return new Date(Date.now() + utcOffsetSeconds * 1000)
}

export function compass(deg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(((deg % 360) / 22.5)) % 16]
}

export function windSpeed(kmh, unit) {
  if (kmh == null) return '—'
  return unit === 'F' ? `${Math.round(kmh / 1.609)} mph` : `${Math.round(kmh)} km/h`
}

export function distance(m, unit) {
  if (m == null) return '—'
  if (unit === 'F') return `${(m / 1609).toFixed(m < 16090 ? 1 : 0)} mi`
  return m >= 10000 ? `${Math.round(m / 1000)} km` : `${(m / 1000).toFixed(1)} km`
}
