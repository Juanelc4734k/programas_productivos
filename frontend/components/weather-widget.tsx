import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Droplets, Thermometer } from "lucide-react"

export function WeatherWidget() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Clima</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-gray-600" />
              <span className="text-sm">Parcialmente nublado</span>
            </div>
            <span className="text-lg font-bold">24°C</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Droplets className="w-3 h-3 text-blue-600" />
              <span>Humedad: 75%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-red-600" />
              <span>Sensación: 26°C</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
