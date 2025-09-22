"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, Leaf } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Programa Café Sostenible",
    location: "Vereda El Progreso",
    beneficiaries: 45,
    progress: 75,
    stage: "Desarrollo",
    startDate: "2024-03-15",
    endDate: "2024-12-15",
    status: "active",
  },
  {
    id: 2,
    name: "Agricultura Familiar",
    location: "Vereda La Esperanza",
    beneficiaries: 32,
    progress: 60,
    stage: "Implementación",
    startDate: "2024-04-01",
    endDate: "2025-01-30",
    status: "active",
  },
  {
    id: 3,
    name: "Ganadería Sostenible",
    location: "Vereda San José",
    beneficiaries: 28,
    progress: 40,
    stage: "Inicio",
    startDate: "2024-05-10",
    endDate: "2025-03-10",
    status: "active",
  },
]

export function ProjectTracker() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-gray-600">Programas Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">105</p>
                <p className="text-sm text-gray-600">Beneficiarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Veredas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {project.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {project.beneficiaries} beneficiarios
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(project.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(project.status)}>{project.stage}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso del proyecto</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Finaliza: {new Date(project.endDate).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
