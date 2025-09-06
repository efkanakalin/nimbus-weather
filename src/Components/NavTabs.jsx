import { useNavigate, useLocation } from "react-router-dom"

export default function NavTabs() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex items-center justify-between py-6">
      {/* Logo - Top Left */}
      <div className="flex items-center">
        <h1 className="text-3xl font-bold text-white">
          EFK Weather
        </h1>
      </div>

      {/* About Button - Top Right */}
      <button
        onClick={() => navigate('/about')}
        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
      >
        About
      </button>
    </div>
  )
}