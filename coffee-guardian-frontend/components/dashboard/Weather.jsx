import React, { useEffect, useState } from "react";
import { FaSun, FaCloud, FaCloudRain, FaThermometerHalf } from "react-icons/fa";

const WEATHER_API_KEY = "9628053ffc68fc8af39a85c9d3c9fe15"; // Replace with your real API key

function getWeatherIcon(condition) {
  const cond = condition.toLowerCase();
  if (cond.includes("sun"))
    return <FaSun className="h-8 w-8 text-yellow-500" />;
  if (cond.includes("rain"))
    return <FaCloudRain className="h-8 w-8 text-blue-500" />;
  return <FaCloud className="h-8 w-8 text-gray-500" />;
}

const Weather = ({ userProfile }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get lat/lon or fallback to user's city
  const locationQuery = userProfile?.location
    ? // If you store lat/lon in profile, use it here:
      `q=${userProfile.location}`
    : "q=Chikmagalur,IN"; // fallback

  // Fetch current weather and forecast
  useEffect(() => {
    setLoading(true);
    // Example: Use OpenWeatherMap One Call API (replace with your API/endpoint)
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?${locationQuery}&appid=${WEATHER_API_KEY}&units=metric`
    )
      .then((res) => res.json())
      .then((data) => {
        setWeather({
          location: `${data.city.name}, ${data.city.country}`,
          temperature: Math.round(data.list[0].main.temp),
          condition: data.list[0].weather[0].description,
          humidity: data.list[0].main.humidity,
          wind: `${Math.round(data.list[0].wind.speed)} km/h`,
        });
        // Get forecast for the next 4 days (every 24 hours step)
        const dailyForecasts = data.list
          .filter((_, i) => i % 8 === 0)
          .slice(1, 5)
          .map((item) => ({
            date: new Date(item.dt_txt).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            temp: Math.round(item.main.temp),
            condition: item.weather[0].description,
          }));
        setForecast(dailyForecasts);
        setLoading(false);
      });
  }, [userProfile]);

  if (loading || !weather) {
    return (
      <div
        className="rounded-xl shadow-lg p-6"
        style={{
          background: "rgba(255, 255, 255, 0.18)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(11px)",
          WebkitBackdropFilter: "blur(11px)",
          border: "1px solid rgba(255, 255, 255, 0.28)",
        }}
      >
        <div className="animate-pulse h-10 bg-gray-200 rounded" />
        <div className="animate-pulse h-20 mt-6 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div
      className="rounded-xl shadow-lg p-6 flex flex-col"
      style={{
        background: "rgba(255, 255, 255, 0.18)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(11px)",
        WebkitBackdropFilter: "blur(11px)",
        border: "1px solid rgba(255, 255, 255, 0.28)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Weather</h3>
        <div className="text-xs text-gray-500">Live</div>
      </div>

      <div className="flex items-center mb-4">
        {getWeatherIcon(weather.condition)}
        <div className="ml-4">
          <div className="text-2xl font-bold text-gray-900">
            {weather.temperature}°C
          </div>
          <div
            className="text-sm text-gray-800"
            style={{ textShadow: "0 1px 4px rgba(255,255,255,0.6)" }}
          >
            {weather.condition}
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="text-gray-900">{weather.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Humidity:</span>
          <span className="text-gray-900">{weather.humidity}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Wind:</span>
          <span className="text-gray-900">{weather.wind}</span>
        </div>
      </div>

      {/* Forecast */}
      <div className="mt-5">
        <div className="font-semibold text-gray-800 mb-2">Forecast</div>
        <div className="flex space-x-5">
          {forecast.map((f, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center px-2"
            >
              <span className="text-xs text-gray-600">{f.date}</span>
              <span className="font-bold text-gray-900">{f.temp}°C</span>
              <span className="text-xs text-gray-700">{f.condition}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-4 p-3"
        style={{
          background: "rgba(137,207,240,0.21)",
          borderRadius: "12px",
        }}
      >
        <div className="flex items-center">
          <FaThermometerHalf className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm text-blue-800">
            {weather.temperature > 20 && weather.temperature < 32
              ? "Good weather for coffee farming activities"
              : "Check crop advisories for current weather"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Weather;
