const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

async function getJson(url, signal) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export async function searchPlaces(query, signal) {
  const q = query.trim()
  if (q.length < 2) return []
  const params = new URLSearchParams({ name: q, count: '7', language: 'en', format: 'json' })
  const data = await getJson(`${GEO_URL}?${params}`, signal)
  return (data.results ?? []).map(r => ({
    id: r.id,
    name: r.name,
    region: r.admin1 ?? '',
    country: r.country ?? '',
    countryCode: r.country_code ?? '',
    lat: r.latitude,
    lon: r.longitude,
  }))
}

export async function reverseGeocode(lat, lon, signal) {
  const params = new URLSearchParams({ latitude: lat, longitude: lon, localityLanguage: 'en' })
  try {
    const d = await getJson(`${REVERSE_URL}?${params}`, signal)
    return {
      id: `geo:${lat.toFixed(3)},${lon.toFixed(3)}`,
      name: d.city || d.locality || d.principalSubdivision || 'My location',
      region: d.principalSubdivision ?? '',
      country: d.countryName ?? '',
      countryCode: d.countryCode ?? '',
      lat,
      lon,
    }
  } catch {
    return { id: `geo:${lat},${lon}`, name: 'My location', region: '', country: '', countryCode: '', lat, lon }
  }
}

const CURRENT = [
  'temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'is_day', 'precipitation',
  'weather_code', 'cloud_cover', 'pressure_msl', 'wind_speed_10m', 'wind_direction_10m',
  'wind_gusts_10m', 'visibility', 'uv_index', 'dew_point_2m',
]
const HOURLY = ['temperature_2m', 'weather_code', 'precipitation_probability', 'is_day']
const DAILY = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'sunrise', 'sunset',
  'uv_index_max', 'precipitation_probability_max', 'precipitation_sum', 'wind_speed_10m_max',
]

export async function getForecast({ lat, lon }, signal) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: CURRENT.join(','),
    hourly: HOURLY.join(','),
    daily: DAILY.join(','),
    timezone: 'auto',
    forecast_days: '10',
    wind_speed_unit: 'kmh',
  })
  const d = await getJson(`${FORECAST_URL}?${params}`, signal)

  const nowIdx = Math.max(0, d.hourly.time.findIndex(t => t >= d.current.time.slice(0, 13)))
  const hourly = d.hourly.time.slice(nowIdx, nowIdx + 25).map((time, i) => ({
    time,
    temp: d.hourly.temperature_2m[nowIdx + i],
    code: d.hourly.weather_code[nowIdx + i],
    pop: d.hourly.precipitation_probability[nowIdx + i] ?? 0,
    isDay: d.hourly.is_day[nowIdx + i] === 1,
  }))

  const daily = d.daily.time.map((date, i) => ({
    date,
    code: d.daily.weather_code[i],
    max: d.daily.temperature_2m_max[i],
    min: d.daily.temperature_2m_min[i],
    sunrise: d.daily.sunrise[i],
    sunset: d.daily.sunset[i],
    uvMax: d.daily.uv_index_max[i],
    pop: d.daily.precipitation_probability_max[i] ?? 0,
    rain: d.daily.precipitation_sum[i] ?? 0,
    windMax: d.daily.wind_speed_10m_max[i],
  }))

  const c = d.current
  return {
    timezone: d.timezone,
    utcOffset: d.utc_offset_seconds,
    current: {
      time: c.time,
      temp: c.temperature_2m,
      feels: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      dewPoint: c.dew_point_2m,
      isDay: c.is_day === 1,
      precipitation: c.precipitation,
      code: c.weather_code,
      cloudCover: c.cloud_cover,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDir: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      visibility: c.visibility,
      uv: c.uv_index,
    },
    hourly,
    daily,
  }
}

export async function getAirQuality({ lat, lon }, signal) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide',
    timezone: 'auto',
  })
  try {
    const d = await getJson(`${AIR_URL}?${params}`, signal)
    return {
      aqi: d.current.us_aqi,
      pm25: d.current.pm2_5,
      pm10: d.current.pm10,
      o3: d.current.ozone,
      no2: d.current.nitrogen_dioxide,
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return null
  }
}
