"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Heart, Smile } from "lucide-react"

export function WelcomeMessage() {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Buenos días" : currentHour < 18 ? "Buenas tardes" : "Buenas noches"

  return (
    <Card className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-2xl border-0">
      <CardContent className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-4">{greeting}, querido campesino! 👋</h2>

        <p className="text-xl md:text-2xl mb-6 opacity-95">
          Nos alegra verte por aquí. Estamos para apoyarte en todo lo que necesites.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <Smile className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Fácil de usar</p>
            <p className="text-sm opacity-90">Todo muy sencillo</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <Sun className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Siempre disponible</p>
            <p className="text-sm opacity-90">24 horas para ti</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <Heart className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Con cariño</p>
            <p className="text-sm opacity-90">Hechos para ti</p>
          </div>
        </div>

        <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-bold text-lg px-8 py-4">
          🎯 Empezar ahora
        </Button>
      </CardContent>
    </Card>
  )
}
