import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavTabs from "./Components/NavTabs";
import WeatherPage from "./Pages/WeatherPage";
import AboutPage from "./Pages/AboutPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <NavTabs />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative z-10">
          <Routes>
            <Route path="/" element={<WeatherPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center p-6 text-slate-400">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-light">
              © {new Date().getFullYear()} EFK Weather - Elegant Weather Experience
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;