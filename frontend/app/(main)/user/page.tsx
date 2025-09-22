

'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Header } from "@/components/header"
import { MainDashboard } from "@/components/main-dashboard"
import { QuickActions } from "@/components/quick-actions"
import { WeatherInfo } from "@/components/weather-info"
import { NewsPanel } from "@/components/news-panel"
import { SupportChat } from "@/components/support-chat"
import { RouteGuard } from '@/components/route-guard'

// Diccionario de veredas a coordenadas
const veredaCoords: Record<string, { lat: number, lon: number }> = {
  "Campo Alegre": { lat: 6.246, lon: -75.567 },
  "Carmelo": { lat: 6.248, lon: -75.562 },
  "El Caunzal": { lat: 6.244, lon: -75.573 },
  "El Churimo": { lat: 6.251, lon: -75.575 },
  "El Encenillo": { lat: 6.253, lon: -75.580 },
  "El Gavilán": { lat: 6.259, lon: -75.568 },
  "El Olival": { lat: 6.262, lon: -75.571 },
  "El Socorro": { lat: 6.265, lon: -75.565 },
  "El Tablazo": { lat: 6.269, lon: -75.572 },
  "Getsemaní": { lat: 6.272, lon: -75.569 },
  "La Camelia": { lat: 6.276, lon: -75.574 },
  "La Granja": { lat: 6.278, lon: -75.578 },
  "La Honda": { lat: 6.281, lon: -75.570 },
  "La Merced": { lat: 6.285, lon: -75.573 },
  "La Peña": { lat: 6.289, lon: -75.575 },
  "La Quiebra": { lat: 6.292, lon: -75.577 },
  "La Trinidad": { lat: 6.295, lon: -75.579 },
  "Montebello": { lat: 6.246, lon: -75.568 },
  "Palmitas": { lat: 6.298, lon: -75.581 },
  "Paraje El Aguacate": { lat: 6.300, lon: -75.584 },
  "Piedra Galana": { lat: 6.303, lon: -75.586 },
  "Sabanitas": { lat: 6.305, lon: -75.589 },
  "San Antonio": { lat: 6.308, lon: -75.591 },
  "Sector El Barro": { lat: 6.310, lon: -75.593 },
  "Sector El Cortado": { lat: 6.312, lon: -75.595 },
  "Sector El Obispo": { lat: 6.315, lon: -75.597 },
  "Sector La Palma": { lat: 6.318, lon: -75.599 },
  "Sector Los Pinos": { lat: 6.320, lon: -75.601 },
  "Zarcitos": { lat: 6.323, lon: -75.603 },
};

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  uvIndex: string;
  condition: string;
  recommendation: string;
}

function getRecommendation(condition: string, temp: number): string {
  if (condition.includes("Lluvia")) return "Lleva paraguas y usa botas impermeables.";
  if (condition.includes("Nublado")) return "Buen día para actividades de campo, pero atento a posibles lluvias.";
  if (condition.includes("Despejado")) {
    if (temp > 30) return "Hidrátate bien y evita el sol en las horas pico.";
    if (temp > 25) return "Buen clima para trabajar, recuerda mantenerte hidratado.";
    return "Excelente día para trabajar al aire libre.";
  }
  if (condition.includes("Tormenta")) return "Permanece en casa si es posible y evita zonas abiertas.";
  if (condition.includes("Niebla")) return "Precaución al movilizarte, visibilidad reducida.";
  return "Mantente atento a los cambios del clima durante el día.";
}

// Función para esperar un tiempo determinado
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache simple para evitar múltiples llamadas
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

async function getWeatherData(coords: { lat: number, lon: number }, retries = 3): Promise<WeatherData> {
  const cacheKey = `${coords.lat}-${coords.lon}`;
  const cached = weatherCache.get(cacheKey);
  
  // Verificar si hay datos en caché válidos
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Usando datos del clima desde caché');
    return cached.data;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Intento ${attempt} de obtener datos del clima para coordenadas:`, coords);
      
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation_probability,uv_index`,
        { 
          cache: 'no-store',
          headers: {
            'User-Agent': 'AlcaldiaApp/1.0'
          }
        }
      );
      
      if (response.status === 429) {
        console.warn(`Rate limit alcanzado (intento ${attempt}/${retries}). Esperando antes del siguiente intento...`);
        if (attempt < retries) {
          // Esperar más tiempo en cada intento (backoff exponencial)
          await delay(Math.pow(2, attempt) * 1000);
          continue;
        }
        throw new Error('Límite de solicitudes excedido. Intenta más tarde.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validar que los datos necesarios estén presentes
      if (!data.current_weather) {
        console.error('API response missing current_weather:', data);
        throw new Error('Datos del clima no disponibles');
      }
      
      console.log('Datos del clima recibidos:', {
        temperatura_actual: data.current_weather?.temperature,
        sensacion_termica: data.hourly?.apparent_temperature?.[0],
        humedad: data.hourly?.relativehumidity_2m?.[0],
        velocidad_viento: data.current_weather?.windspeed,
        indice_uv: data.hourly?.uv_index?.[0],
        codigo_clima: data.current_weather?.weathercode
      });

      const weatherCode = data.current_weather?.weathercode || 0;
      const conditionMap: Record<number, string> = {
        0: "Despejado",
        1: "Mayormente despejado",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Niebla",
        48: "Niebla escarchada",
        51: "Llovizna ligera",
        61: "Lluvia ligera",
        71: "Nieve ligera",
        95: "Tormenta",
      };

      const condition = conditionMap[weatherCode] || "Desconocido";
      const temperature = data.current_weather?.temperature || 20;
      const recommendation = getRecommendation(condition, temperature);

      const weatherData: WeatherData = {
        temperature: temperature,
        feelsLike: data.hourly?.apparent_temperature?.[0] || temperature,
        humidity: data.hourly?.relativehumidity_2m?.[0] || 70,
        windSpeed: data.current_weather?.windspeed || 0,
        uvIndex: `${data.hourly?.uv_index?.[0] || "Moderado"}`,
        condition,
        recommendation,
      };

      // Guardar en caché
      weatherCache.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      console.log('Datos procesados y guardados en caché:', {
        condicion: condition,
        recomendacion: recommendation
      });

      return weatherData;
    } catch (error) {
      console.error(`Error en intento ${attempt}:`, error);
      
      if (attempt === retries) {
        console.error('Todos los intentos fallaron, usando datos por defecto');
        // Devolver datos por defecto en caso de error
        return {
          temperature: 20,
          feelsLike: 20,
          humidity: 70,
          windSpeed: 0,
          uvIndex: "Moderado",
          condition: "Desconocido",
          recommendation: "No se pudieron obtener datos del clima. Mantente atento a las condiciones locales.",
        };
      }
      
      // Esperar antes del siguiente intento
      await delay(1000 * attempt);
    }
  }

  // Este punto nunca debería alcanzarse, pero TypeScript lo requiere
  throw new Error('Error inesperado al obtener datos del clima');
}

export default function HomePage() {
  const { user, loading } = useAuthContext();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData() {
      if (!user?.vereda) {
        console.log('Usuario o vereda no disponible aún');
        return;
      }

      try {
        setWeatherLoading(true);
        console.log('Vereda del usuario:', user.vereda);
        
        const coords = veredaCoords[user.vereda] || veredaCoords["Montebello"];
        console.log('Coordenadas para el clima:', coords);
        
        const weatherData = await getWeatherData(coords);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error al obtener datos del clima:', error);
        // Establecer datos por defecto en caso de error
        setWeather({
          temperature: 20,
          feelsLike: 20,
          humidity: 70,
          windSpeed: 0,
          uvIndex: "Moderado",
          condition: "Desconocido",
          recommendation: "No se pudieron obtener datos del clima. Mantente atento a las condiciones locales.",
        });
      } finally {
        setWeatherLoading(false);
      }
    }

    fetchWeatherData();
  }, [user?.vereda]);

  if (loading || weatherLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar los datos del clima</p>
        </div>
      </div>
    );
  }

  return (
    <RouteGuard allowedRoles={['campesino']}>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
            {/* Sidebar de navegación */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="space-y-6">
                {/* Acciones rápidas */}
                <QuickActions />

                {/* Información del clima */}
                <WeatherInfo weather={weather} />

                {/* Panel de noticias */}
                <NewsPanel />
              </div>
            </div>

            {/* Contenido principal */}
            <div className="xl:col-span-3 order-1 xl:order-2">
              <div className="space-y-6">
                {/* Dashboard principal */}
                <MainDashboard />

                {/* Chat de soporte */}
                <SupportChat />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}