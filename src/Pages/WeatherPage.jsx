import { useState } from "react"
import { getWeather } from "../utils/api"

export default function WeatherPage() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!city.trim()) return
    
    setLoading(true)
    setError("")
    
    try {
      const data = await getWeather(city)
      setWeather(data)
    } catch (err) {
      setError("Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'snow': '❄️',
      'thunderstorm': '⛈️',
      'mist': '🌫️',
      'fog': '🌫️',
      'haze': '🌫️'
    }
    return icons[condition?.toLowerCase()] || '🌤️'
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      {/* Main Content */}
      <div className="text-center py-20">
        {/* Slogan */}
        <div className="mb-12">
          <h2 className="text-4xl font-light text-white mb-4">
            Seeing the weather of the whole world{" "}
            <span className="text-blue-300 font-medium">with EFK Weather!</span>
          </h2>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="w-full relative">
              <input
                className="w-full input-modern rounded-2xl text-center"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search Here"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !city.trim()}
              className="btn-primary bg-gradient-to-r from-slate-700 to-slate-600 text-white font-medium px-8 py-3 rounded-xl hover:from-slate-600 hover:to-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-400 shadow-lg hover:shadow-xl text-lg whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-center text-base font-medium">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Weather Results */}
      {weather && (
        <div className="glass rounded-3xl p-8 weather-card max-w-6xl mx-auto">
          <div className="text-center">
            {/* Main Weather Info */}
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-4xl font-light text-high-contrast mb-2">{weather.name}</h2>
              <p className="text-subtle text-xl capitalize mb-6">
                {weather.weather[0].description}
              </p>
              <div className="text-8xl font-light text-high-contrast mb-4">
                {Math.round(weather.main.temp)}°
              </div>
              <p className="text-subtle text-lg">
                Feels like: {Math.round(weather.main.feels_like)}°C
              </p>
            </div>

            {/* Detailed Weather Info */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-light text-high-contrast mb-8 text-center">Weather Details</h3>
              
              <div className="grid grid-cols-4 gap-6 max-w-3xl mx-auto">
                <div className="bg-white/15 rounded-2xl p-6 text-center">
                  <div className="text-subtle text-sm mb-2">Humidity</div>
                  <div className="text-high-contrast font-light text-2xl">{weather.main.humidity}%</div>
                </div>
                
                <div className="bg-white/15 rounded-2xl p-6 text-center">
                  <div className="text-subtle text-sm mb-2">Wind</div>
                  <div className="text-high-contrast font-light text-2xl">{weather.wind?.speed || 0} m/s</div>
                </div>
                
                <div className="bg-white/15 rounded-2xl p-6 text-center">
                  <div className="text-subtle text-sm mb-2">Pressure</div>
                  <div className="text-high-contrast font-light text-2xl">{weather.main.pressure} hPa</div>
                </div>
                
                <div className="bg-white/15 rounded-2xl p-6 text-center">
                  <div className="text-subtle text-sm mb-2">Visibility</div>
                  <div className="text-high-contrast font-light text-2xl">
                    {weather.visibility ? `${weather.visibility / 1000} km` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Temperature Range */}
              <div className="bg-white/15 rounded-2xl p-6 max-w-2xl mx-auto mt-8">
                <div className="flex justify-between items-center text-high-contrast">
                  <div className="text-center">
                    <div className="text-subtle text-sm mb-1">Min</div>
                    <div className="font-light text-xl">{Math.round(weather.main.temp_min)}°C</div>
                  </div>
                  <div className="flex-1 mx-6">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${((weather.main.temp - weather.main.temp_min) / (weather.main.temp_max - weather.main.temp_min)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-subtle text-sm mb-1">Max</div>
                    <div className="font-light text-xl">{Math.round(weather.main.temp_max)}°C</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      {!weather && !loading && (
        <div className="glass rounded-2xl p-8 text-center weather-card max-w-4xl mx-auto">
          <h3 className="text-2xl font-light text-high-contrast mb-4">
            Discover Weather Information
          </h3>
          <p className="text-subtle text-lg max-w-3xl mx-auto font-light">
            Enter any city name in the search box above to get current weather information for that city.
          </p>
        </div>
      )}
    </div>
  )
}