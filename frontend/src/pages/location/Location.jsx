import React, { useState, useEffect } from 'react';
import { MapPin, CloudSun } from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Location() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });

        try {
          // Fetch address using Nominatim (OpenStreetMap Geocoding API)
          const locationResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const locationData = await locationResponse.json();
          if (locationData.address) {
            const { city, town, village, municipality, state, country } = locationData.address;
            setLocation({
              city: city || town || village || municipality || 'Unknown City',
              state: state || 'Unknown State',
              country: country || 'Unknown Country'
            });
          }

          // Fetch weather using Open-Meteo API
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const weatherData = await weatherResponse.json();
          if (weatherData.current_weather) {
            setWeather(`${weatherData.current_weather.temperature}°C, ${weatherData.current_weather.weathercode}`);
          }
        } catch (error) {
          toast.error('Error fetching location or weather data');
        }

        setLoading(false);
      },
      () => {
        toast.error('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Location</h1>
      <div className="bg-gray-900 rounded-lg p-6">
        <button
          onClick={getLocation}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 flex items-center gap-2"
        >
          <MapPin size={20} />
          {loading ? 'Getting location...' : 'Obtain location'}
        </button>

        {location && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="text-blue-500" />
              <span>{`${location.city}, ${location.state}`}</span>
            </div>
            {weather && (
              <div className="flex items-center gap-2">
                <CloudSun className="text-yellow-500" />
                <span>{weather}</span>
              </div>
            )}
            <div className="mt-4 bg-gray-800 rounded-lg p-4 h-96 relative">
              {coordinates ? (
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-lg"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[coordinates.latitude, coordinates.longitude]}>
                    <Popup>Your Location</Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p className="text-sm text-gray-400">Map will be displayed here using OpenStreetMap</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
