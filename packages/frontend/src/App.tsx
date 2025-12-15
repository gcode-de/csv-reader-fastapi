import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return saved === "true";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("darkMode") === null) {
        setDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", String(newMode));
  };
  // const [data, setData] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  return (
    <div className={darkMode ? "dark min-h-screen bg-slate-950 p-8" : "min-h-screen bg-slate-50 p-8"}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={darkMode ? "text-3xl font-bold text-slate-100" : "text-3xl font-bold text-slate-900"}>CSV Parser</h1>
            <p className={darkMode ? "text-slate-400 mt-1" : "text-slate-600 mt-1"}>Frontend</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDarkModeToggle} variant="outline">
              {darkMode ? "☀️" : "🌙"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
