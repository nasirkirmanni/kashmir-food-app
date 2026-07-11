const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

// 1. Add temperature state
if (!js.includes('const [temperature, setTemperature]')) {
  js = js.replace(
    'export default function ExploreClient({ data }) {',
    `export default function ExploreClient({ data }) {\n  const [temperature, setTemperature] = useState("...");\n\n  useEffect(() => {\n    async function fetchWeather() {\n      try {\n        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=34.0837&longitude=74.7973&current_weather=true");\n        const data = await res.json();\n        if (data && data.current_weather) {\n          setTemperature(Math.round(data.current_weather.temperature));\n        }\n      } catch (err) {\n        console.error("Failed to fetch weather", err);\n      }\n    }\n    fetchWeather();\n  }, []);\n`
  );
}

// 2. Replace static string
js = js.replace(/<span className="weather-chip mono">Srinagar [·\-] \d+°C<\/span>/, '<span className="weather-chip mono">Srinagar · {temperature}°C</span>');
js = js.replace('<span className="weather-chip mono">Srinagar · 29°C</span>', '<span className="weather-chip mono">Srinagar · {temperature}°C</span>');

fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
console.log('Weather feature injected!');
