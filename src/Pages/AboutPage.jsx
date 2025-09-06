export default function AboutPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-6">
      <div className="glass rounded-3xl p-12 weather-card">
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-high-contrast mb-4 gradient-text">
            About
          </h1>
          <p className="text-subtle text-lg max-w-3xl mx-auto font-light">
            Modern and user-friendly weather application
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          <div className="bg-white/15 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-light text-high-contrast mb-3">Real-time Data</h3>
            <p className="text-subtle font-light">
              We provide current and accurate weather information using OpenWeatherMap API.
            </p>
          </div>

          <div className="bg-white/15 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-light text-high-contrast mb-3">Modern Design</h3>
            <p className="text-subtle font-light">
              Modern user experience with glass morphism and gradient effects.
            </p>
          </div>

          <div className="bg-white/15 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-light text-high-contrast mb-3">Responsive</h3>
            <p className="text-subtle font-light">
              Perfect appearance and user experience on all devices.
            </p>
          </div>

          <div className="bg-white/15 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-light text-high-contrast mb-3">Fast</h3>
            <p className="text-subtle font-light">
              Fast loading and response times with optimized performance.
            </p>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-2xl font-light text-high-contrast mb-6">Technologies</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Tailwind CSS', 'Vite', 'OpenWeatherMap API'].map((tech) => (
              <span 
                key={tech}
                className="bg-white/15 text-high-contrast px-4 py-2 rounded-full text-sm font-light"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
  