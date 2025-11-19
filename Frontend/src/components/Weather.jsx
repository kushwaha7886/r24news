import { useState, useEffect } from "react";
import axios from "axios";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState({ latitude: 40.7128, longitude: -74.0060 }); // Default to NYC

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log("Geolocation error:", error);
          // Use default location
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/v1/weather/fetch`, {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            location: "Current Location"
          }
        });
        console.log("Weather API response:", response.data);
        setWeather(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setError("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Weather</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Weather</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Weather</h3>
      {weather && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{weather.temperature}°C</span>
            <span className="text-gray-600">{weather.weatherDescription}</span>
          </div>
          <div className="text-sm text-gray-500">
            <p>Location: {weather.location}</p>
            {weather.humidity && <p>Humidity: {weather.humidity}%</p>}
            {weather.windSpeed && <p>Wind Speed: {weather.windSpeed} km/h</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
