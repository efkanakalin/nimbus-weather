import { useCallback, useEffect, useState } from 'react'
import Sky from './components/Sky'
import SearchBar from './components/SearchBar'
import Hero from './components/Hero'
import Hourly from './components/Hourly'
import Daily from './components/Daily'
import Details from './components/Details'
import { describe } from './lib/conditions'
import { getAirQuality, getForecast, reverseGeocode } from './lib/weather'
import { flag } from './lib/format'

const DEFAULT_PLACE = { id: 745044, name: 'Istanbul', region: 'Istanbul', country: 'Türkiye', countryCode: 'TR', lat: 41.01384, lon: 28.94966 }

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" aria-hidden>
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe29a" />
            <stop offset="100%" stopColor="#ff9f5a" />
          </linearGradient>
        </defs>
        <circle cx="25" cy="14" r="8" fill="url(#logo-g)" />
        <path d="M9 31h20a6.5 6.5 0 0 0 .9-12.9A9 9 0 0 0 12.7 16 7.5 7.5 0 0 0 9 31z" fill="white" fillOpacity=".92" />
      </svg>
      <span className="font-display text-2xl font-semibold tracking-tight text-white">Nimbus</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading forecast">
      <div className="space-y-3">
        <div className="shimmer h-4 w-40 rounded-full" />
        <div className="shimmer h-16 w-72 max-w-full rounded-2xl" />
        <div className="shimmer mt-6 h-36 w-56 rounded-3xl" />
      </div>
      <div className="shimmer h-44 rounded-3xl" />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
        <div className="shimmer h-[30rem] rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="shimmer h-56 rounded-3xl" />)}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [place, setPlace] = useState(() => load('nimbus:place', DEFAULT_PLACE))
  const [unit, setUnit] = useState(() => load('nimbus:unit', 'C'))
  const [recents, setRecents] = useState(() => load('nimbus:recents', []))
  const [data, setData] = useState(null)
  const [air, setAir] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError('')
    Promise.all([getForecast(place, ctrl.signal), getAirQuality(place, ctrl.signal)])
      .then(([forecast, airQuality]) => {
        setData(forecast)
        setAir(airQuality)
        setLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError('We couldn’t reach the weather service. Check your connection and try again.')
        setLoading(false)
      })
    return () => ctrl.abort()
  }, [place, reloadKey])

  useEffect(() => {
    const id = setInterval(() => setReloadKey(k => k + 1), 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!data) return
    const t = Math.round(unit === 'F' ? data.current.temp * 9 / 5 + 32 : data.current.temp)
    document.title = `${t}° ${place.name} · Nimbus`
  }, [data, place, unit])

  const selectPlace = useCallback((p) => {
    setPlace(p)
    save('nimbus:place', p)
    setRecents(prev => {
      const next = [p, ...prev.filter(r => r.id !== p.id)].slice(0, 6)
      save('nimbus:recents', next)
      return next
    })
  }, [])

  const locate = () => {
    if (!navigator.geolocation) {
      setError('Your browser does not support location.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const p = await reverseGeocode(coords.latitude, coords.longitude)
        setLocating(false)
        selectPlace(p)
      },
      () => {
        setLocating(false)
        setError('Location permission was denied. Search for a city instead.')
      },
      { timeout: 10000, maximumAge: 600000 },
    )
  }

  const toggleUnit = () => {
    const next = unit === 'C' ? 'F' : 'C'
    setUnit(next)
    save('nimbus:unit', next)
  }

  const kind = data ? describe(data.current.code).kind : 'clear'
  const isDay = data ? data.current.isDay : true

  return (
    <>
      <Sky kind={kind} isDay={isDay} />

      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="relative z-20 flex flex-wrap items-center gap-3 sm:gap-4">
          <Logo />
          <div className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto sm:max-w-md sm:flex-1">
            <SearchBar onSelect={selectPlace} onLocate={locate} locating={locating} />
          </div>
          <button
            type="button"
            onClick={toggleUnit}
            aria-label={`Switch to °${unit === 'C' ? 'F' : 'C'}`}
            className="glass relative ml-auto flex h-12 items-center rounded-2xl p-1 text-sm font-semibold sm:ml-0"
          >
            <span
              className="absolute top-1 h-10 w-11 rounded-xl bg-white/25 transition-transform duration-300"
              style={{ transform: `translateX(${unit === 'C' ? 0 : 44}px)` }}
            />
            <span className={`relative z-10 grid w-11 place-items-center ${unit === 'C' ? 'text-white' : 'text-white/60'}`}>°C</span>
            <span className={`relative z-10 grid w-11 place-items-center ${unit === 'F' ? 'text-white' : 'text-white/60'}`}>°F</span>
          </button>
        </header>

        {recents.length > 1 && (
          <nav aria-label="Recent cities" className="scroll-x mt-4 flex gap-2 overflow-x-auto pb-1">
            {recents.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => selectPlace(r)}
                className={`glass shrink-0 rounded-full px-3.5 py-1.5 text-sm transition hover:bg-white/25 ${r.id === place.id ? 'bg-white/25 text-white' : 'text-white/80'}`}
              >
                <span className="mr-1.5">{flag(r.countryCode)}</span>
                {r.name}
              </button>
            ))}
          </nav>
        )}

        <main className="mt-8 flex-1 sm:mt-12">
          {error && (
            <div role="alert" className="glass mb-6 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm text-white">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => { setError(''); setReloadKey(k => k + 1) }}
                className="shrink-0 rounded-xl bg-white/20 px-3 py-1.5 font-medium hover:bg-white/30"
              >
                Retry
              </button>
            </div>
          )}

          {loading && !data ? (
            <Skeleton />
          ) : data ? (
            <div key={place.id} className={`space-y-6 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
              <Hero place={place} data={data} unit={unit} />
              <Hourly hours={data.hourly} unit={unit} />
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,2fr)]">
                <Daily days={data.daily} current={data.current} unit={unit} />
                <Details data={data} air={air} unit={unit} />
              </div>
            </div>
          ) : null}
        </main>

        <footer className="mt-12 flex flex-col items-center justify-between gap-2 text-xs text-white/60 sm:flex-row">
          <p>
            Weather data by{' '}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-2 hover:text-white">
              Open-Meteo
            </a>{' '}
            · refreshes every 10 minutes
          </p>
          <p>
            Crafted by{' '}
            <a href="https://github.com/efkanakalin" target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-2 hover:text-white">
              Efkan Akalın
            </a>
          </p>
        </footer>
      </div>
    </>
  )
}
