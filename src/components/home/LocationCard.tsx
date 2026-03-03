"use client";

import React, { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Moon, Calendar, Clock, MapPin } from "lucide-react";

interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

const getWeatherIcon = (code: number, isDay: boolean) => {
  if (code === 0 || code === 1) {
    return isDay ? <Sun className="w-8 h-8 text-[#E6A627] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" /> : <Moon className="w-8 h-8 text-blue-400 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />;
  }
  if (code === 2 || code === 3) {
    return <Cloud className="w-8 h-8 text-black opacity-80" />;
  }
  if ([45, 48].includes(code)) {
    return <Cloud className="w-8 h-8 text-gray-700" />;
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return <CloudRain className="w-8 h-8 text-blue-600 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />;
  }
  if ([95, 96, 99].includes(code)) {
    return <CloudLightning className="w-8 h-8 text-purple-600 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />;
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return <Snowflake className="w-8 h-8 text-cyan-500 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" />;
  }
  return <Cloud className="w-8 h-8 text-black" />;
};

function LocationSkeleton() {
  return (
    <div className="h-full flex flex-col md:flex-row bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden animate-pulse">
      <div className="w-full md:w-[60%] p-5 border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#F4F4F5]">
        <div className="w-8 h-8 bg-black/20 rounded mb-3"></div>
        <div className="w-24 h-6 bg-black/20 rounded mb-1"></div>
        <div className="w-32 h-4 bg-black/20 rounded mt-4"></div>
      </div>
      <div className="w-full md:w-[40%] bg-[#E6A627] p-5 flex flex-col justify-center items-center gap-4">
        <div className="w-16 h-6 bg-black/20 rounded"></div>
        <div className="w-20 h-4 bg-black/20 rounded"></div>
      </div>
    </div>
  );
}

export function LocationCard() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Jakarta",
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          timeZone: "Asia/Jakarta",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=-0.9492&longitude=100.3543&current=temperature_2m,weather_code,is_day&timezone=auto");
        if (res.ok) {
          const data = await res.json();
          setWeather({
            temperature: data.current.temperature_2m,
            weatherCode: data.current.weather_code,
            isDay: data.current.is_day === 1,
          });
        }
      } catch (error) {
        console.error("Failed to fetch weather", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code === 1 || code === 2 || code === 3) return "Partly Cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Unknown";
  };

  if (loading) {
    return <LocationSkeleton />;
  }

  // Neobrutalism design: strict solid colors, harsh borders, prominent bold fonts
  return (
    <div className="h-full relative overflow-hidden bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all group">
      <div className="flex flex-col md:flex-row h-full">
        {/* Left Side: Location & Weather */}
        <div className="w-full md:w-[60%] h-full bg-[#F4F4F5] p-5 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-black relative">
          
          <div className="absolute top-0 right-0 p-3 opacity-20 pointer-events-none">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="square">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>

          <div className="z-10">
            <a
              href="https://www.google.com/maps/place/Padang,+West+Sumatra"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-2 mb-3 bg-black text-white hover:bg-[#E6A627] hover:text-black border-2 border-transparent hover:border-black rounded shadow-[2px_2px_0px_rgba(100,100,100,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
              aria-label="View location on Google Maps"
            >
              <MapPin className="w-4 h-4" />
            </a>
            <h3 className="font-head text-2xl font-black text-black leading-tight uppercase tracking-tight">Padang</h3>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">West Sumatra, ID</p>
          </div>

          {weather && (
            <div className="flex items-center gap-4 mt-6 z-10">
              <div className="p-3 bg-white border-2 border-black rounded shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                {getWeatherIcon(weather.weatherCode, weather.isDay)}
              </div>
              <div>
                <div className="text-4xl font-black text-black leading-none">{Math.round(weather.temperature)}°</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{getWeatherDescription(weather.weatherCode)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Time & Date */}
        <div className="w-full md:w-[40%] h-full bg-[#E6A627] p-5 flex flex-row md:flex-col justify-center items-center gap-4 md:gap-6 relative overflow-hidden">
          {/* Subtle brutalist background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

          <div className="flex flex-col items-center gap-1 text-center w-full z-10">
            <Clock className="w-5 h-5 text-black mb-1 hidden md:block" />
            <div className="text-2xl md:text-3xl font-black text-black tabular-nums tracking-tighter leading-none bg-white px-2 py-1 border-2 border-black rounded shadow-brutal-sm">{time.split(" ")[0]}</div>
            <div className="text-[10px] font-bold text-black uppercase tracking-widest mt-1 bg-white/50 px-2 py-0.5 rounded-sm border border-black">{time.split(" ")[1] || "WIB"}</div>
          </div>

          <div className="h-8 w-1 md:w-8 md:h-1 bg-black/20 rounded-full z-10 hidden md:block" />

          <div className="flex flex-col items-center gap-1 text-center w-full z-10">
            <Calendar className="w-5 h-5 text-black hidden md:block" strokeWidth={2.5} />
            <div className="text-sm font-black text-black uppercase tracking-wider">{date.split(",")[0]}</div>
            <div className="text-xs font-bold text-black/70 uppercase tracking-widest">{date.split(",")[1]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
