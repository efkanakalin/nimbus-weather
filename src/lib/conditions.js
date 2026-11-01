/** WMO weather interpretation codes → label + visual family. */
const CODES = {
  0: ['Clear sky', 'clear'],
  1: ['Mostly clear', 'clear'],
  2: ['Partly cloudy', 'partly'],
  3: ['Overcast', 'cloudy'],
  45: ['Fog', 'fog'],
  48: ['Freezing fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Drizzle', 'drizzle'],
  55: ['Heavy drizzle', 'drizzle'],
  56: ['Freezing drizzle', 'drizzle'],
  57: ['Freezing drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Rain showers', 'rain'],
  81: ['Rain showers', 'rain'],
  82: ['Violent showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm, hail', 'storm'],
  99: ['Thunderstorm, hail', 'storm'],
}

export function describe(code) {
  const [label, kind] = CODES[code] ?? ['Unknown', 'cloudy']
  return { label, kind }
}

/** Background palette for every sky family, day and night. */
export const SKIES = {
  clear: {
    day: ['#1d6fd8', '#3d9bf0', '#8fd0ff'],
    night: ['#050816', '#0d1638', '#1d2b64'],
  },
  partly: {
    day: ['#2a6cc4', '#5a9be0', '#a9cff2'],
    night: ['#070b1c', '#141d3d', '#2a3561'],
  },
  cloudy: {
    day: ['#4b5d78', '#7486a0', '#a8b6c8'],
    night: ['#0b0f19', '#1b2232', '#2e3748'],
  },
  fog: {
    day: ['#7d8896', '#a3adb8', '#cfd5db'],
    night: ['#121519', '#24292f', '#3a4048'],
  },
  drizzle: {
    day: ['#3e5470', '#5f7895', '#8ea3ba'],
    night: ['#080d16', '#152030', '#25344a'],
  },
  rain: {
    day: ['#2b3d55', '#475d79', '#6d84a0'],
    night: ['#05080f', '#0f1826', '#1d2a3d'],
  },
  snow: {
    day: ['#6f87a6', '#a4b8d0', '#e3ecf5'],
    night: ['#0d1424', '#1f2c45', '#3a4b6b'],
  },
  storm: {
    day: ['#1c2333', '#353f55', '#58627a'],
    night: ['#04050a', '#0d1019', '#1b2030'],
  },
}

export function aqiInfo(aqi) {
  if (aqi == null) return { label: 'No data', color: '#94a3b8', advice: 'Air quality data is not available here.' }
  if (aqi <= 50) return { label: 'Good', color: '#4ade80', advice: 'Air quality is great — enjoy the outdoors.' }
  if (aqi <= 100) return { label: 'Moderate', color: '#facc15', advice: 'Acceptable for most people.' }
  if (aqi <= 150) return { label: 'Unhealthy for some', color: '#fb923c', advice: 'Sensitive groups should limit long outdoor effort.' }
  if (aqi <= 200) return { label: 'Unhealthy', color: '#f87171', advice: 'Reduce prolonged outdoor exertion.' }
  if (aqi <= 300) return { label: 'Very unhealthy', color: '#c084fc', advice: 'Avoid outdoor activity if you can.' }
  return { label: 'Hazardous', color: '#a855f7', advice: 'Stay indoors and keep windows closed.' }
}

export function uvInfo(uv) {
  if (uv == null) return { label: '—', advice: '' }
  if (uv < 3) return { label: 'Low', advice: 'No protection needed.' }
  if (uv < 6) return { label: 'Moderate', advice: 'Sunscreen recommended at midday.' }
  if (uv < 8) return { label: 'High', advice: 'Seek shade around noon.' }
  if (uv < 11) return { label: 'Very high', advice: 'Avoid the midday sun.' }
  return { label: 'Extreme', advice: 'Stay out of the sun if possible.' }
}

/** Colour stop for a temperature in °C, used by range bars and the hourly curve. */
export function tempColor(c) {
  const stops = [
    [-15, [129, 140, 248]],
    [0, [56, 189, 248]],
    [10, [45, 212, 191]],
    [18, [163, 230, 53]],
    [25, [250, 204, 21]],
    [32, [251, 146, 60]],
    [40, [239, 68, 68]],
  ]
  if (c <= stops[0][0]) return `rgb(${stops[0][1].join(',')})`
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]
    const [t0, c0] = stops[i - 1]
    if (c <= t1) {
      const k = (c - t0) / (t1 - t0)
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * k)).join(',')})`
    }
  }
  return `rgb(${stops.at(-1)[1].join(',')})`
}
