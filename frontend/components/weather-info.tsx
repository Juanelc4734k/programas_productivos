import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Wind, Sun, Thermometer } from "lucide-react"

interface WeatherInfoProps {
  weather: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    uvIndex: string;
    condition: string;
    recommendation: string;
  }
}

export function WeatherInfo({ weather }: WeatherInfoProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-blue-900 flex items-center">
          <Cloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Clima Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="text-center mb-3 sm:mb-4">
          <div className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1">
            {weather.temperature}°C
          </div>
          <p className="text-sm sm:text-base text-blue-700">
            {weather.condition}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mb-3 sm:mb-4">
          <div className="flex items-center text-blue-700">
            <Droplets className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Humedad: {weather.humidity}%</span>
          </div>
          <div className="flex items-center text-blue-700">
            <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Viento: {weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center text-blue-700">
            <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">Sensación: {weather.feelsLike}°C</span>
          </div>
          <div className="flex items-center text-blue-700">
            <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">UV: {weather.uvIndex}</span>
          </div>
        </div>

        <div className="p-2 sm:p-3 bg-blue-200 rounded-lg">
          <div className="flex items-start text-blue-800 mb-1">
            <Sun className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-medium">Recomendación:</span>
          </div>
          <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
            {weather.recommendation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
