"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Coffee, Wheat, Heart, MapPin, Calendar, Camera } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Mi Cultivo de Café",
    location: "Finca La Esperanza",
    progress: 75,
    stage: "¡Va muy bien!",
    icon: Coffee,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-800",
    nextStep: "Cosecha en noviembre",
    encouragement: "¡Excelente trabajo! 🌱",
  },
  {
    id: 2,
    name: "Huerta Familiar",
    location: "Patio de casa",
    progress: 60,
    stage: "Creciendo bien",
    icon: Wheat,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-800",
    nextStep: "Regar cada 2 días",
    encouragement: "¡Qué bonita huerta! 👏",
  },
]

export function SimpleProjectView() {
  return (
    <div className="space-y-4">
      {projects.map((project) => {
        const IconComponent = project.icon
        return (
          <Card key={project.id} className="bg-slate-50 border border-slate-200 hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${project.color} rounded-full flex items-center justify-center shadow-md flex-shrink-0`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-800 truncate">{project.name}</h3>

                  <div className="flex items-center space-x-3 text-sm text-slate-600 mb-2">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{project.nextStep}</span>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">Progreso</span>
                      <span className="text-lg font-bold text-coral-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2 bg-slate-200" />
                  </div>

                  <div className={`${project.bgColor} p-2 rounded ${project.borderColor} border mb-3`}>
                    <div className="flex items-center">
                      <Heart className={`w-4 h-4 mr-1 ${project.textColor}`} />
                      <p className={`text-sm font-medium ${project.textColor}`}>{project.encouragement}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white flex-1">
                      Ver detalles
                    </Button>
                    <Button size="sm" variant="outline" className="border-coral-500 text-coral-600 hover:bg-coral-50">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Card className="bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-300">
        <CardContent className="p-4 text-center">
          <h3 className="text-lg font-bold text-violet-800 mb-2">¿Nuevo proyecto?</h3>
          <p className="text-violet-700 mb-3">Te ayudamos a inscribirte</p>
          <Button className="bg-violet-500 hover:bg-violet-600 text-white">🌱 Ver programas</Button>
        </CardContent>
      </Card>
    </div>
  )
}
