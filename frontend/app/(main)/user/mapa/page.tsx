"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Search,
  ArrowLeft,
  Users,
  Coffee,
  Wheat,
  Leaf,
  Eye,
  Navigation,
  Layers,
  BarChart3,
  Download,
  Share2,
  Maximize2,
} from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

// Importar el mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic(() => import("@/components/map-component"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Cargando mapa...</p>
    </div>
  )
})

const proyectos = [
  {
    id: 1,
    name: "Programa Café Sostenible",
    type: "cafe",
    status: "activo",
    location: "Vereda El Progreso",
    coordinates: { lat: 5.8547, lng: -75.6794 },
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    progress: 75,
    budget: 450000000,
    description: "Mejoramiento de cultivos de café con técnicas sostenibles",
    responsable: "Ing. Carlos Mendoza",
    area: "450 hectáreas",
    families: 89,
  },
  {
    id: 2,
    name: "Agricultura Familiar",
    type: "agricultura",
    status: "activo",
    location: "Vereda La Esperanza",
    coordinates: { lat: 5.8647, lng: -75.6894 },
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    progress: 45,
    budget: 320000000,
    description: "Fortalecimiento de la agricultura familiar",
    responsable: "Ing. Ana Herrera",
    area: "280 hectáreas",
    families: 56,
  },
  {
    id: 3,
    name: "Ganadería Sostenible",
    type: "ganaderia",
    status: "activo",
    location: "Vereda San José",
    coordinates: { lat: 5.8447, lng: -75.6694 },
    startDate: "2024-04-15",
    endDate: "2025-04-15",
    progress: 30,
    budget: 580000000,
    description: "Sistemas silvopastoriles y mejoramiento genético",
    responsable: "Dr. Miguel Torres",
    area: "680 hectáreas",
    families: 42,
  },
  {
    id: 4,
    name: "Cultivos Alternativos",
    type: "alternativos",
    status: "planificacion",
    beneficiaries: 45,
    location: "Vereda El Mirador",
    coordinates: { lat: 5.8747, lng: -75.6594 },
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    progress: 15,
    budget: 280000000,
    description: "Promoción de cacao, aguacate y frutales",
    responsable: "Ing. Laura Gómez",
    area: "320 hectáreas",
    families: 38,
  },
  {
    id: 5,
    name: "Apicultura Comunitaria",
    type: "apicultura",
    status: "activo",
    location: "Vereda Las Flores",
    coordinates: { lat: 5.8347, lng: -75.6994 },
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    progress: 60,
    budget: 150000000,
    description: "Desarrollo de la apicultura como alternativa productiva",
    responsable: "Téc. Roberto Silva",
    area: "120 hectáreas",
    families: 25,
  },
]

const veredas = [
  { name: "El Progreso", coordinates: { lat: 5.8547, lng: -75.6794 }, families: 145, projects: 2 },
  { name: "La Esperanza", coordinates: { lat: 5.8647, lng: -75.6894 }, families: 123, projects: 3 },
  { name: "San José", coordinates: { lat: 5.8447, lng: -75.6694 }, families: 98, projects: 1 },
  { name: "El Mirador", coordinates: { lat: 5.8747, lng: -75.6594 }, families: 87, projects: 2 },
  { name: "Las Flores", coordinates: { lat: 5.8347, lng: -75.6994 }, families: 76, projects: 1 },
  { name: "Santa Rosa", coordinates: { lat: 5.8247, lng: -75.7094 }, families: 65, projects: 0 },
  { name: "La Palma", coordinates: { lat: 5.8847, lng: -75.6494 }, families: 54, projects: 1 },
  { name: "El Carmen", coordinates: { lat: 5.8147, lng: -75.7194 }, families: 43, projects: 0 },
]

const tiposProyecto = [
  { value: "todos", label: "Todos los proyectos", color: "bg-gray-500" },
  { value: "cafe", label: "Café", color: "bg-amber-600" },
  { value: "agricultura", label: "Agricultura", color: "bg-emerald-600" },
  { value: "ganaderia", label: "Ganadería", color: "bg-blue-600" },
  { value: "alternativos", label: "Cultivos Alternativos", color: "bg-purple-600" },
  { value: "apicultura", label: "Apicultura", color: "bg-yellow-600" },
]

export default function MapaPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("mapa")
  const [mapCenter, setMapCenter] = useState<[number, number]>([5.9189243, -75.5130946994483]) // Coordenadas de Montebello
  const [mapZoom, setMapZoom] = useState(12)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-emerald-100 text-emerald-800"
      case "planificacion":
        return "bg-blue-100 text-blue-800"
      case "finalizado":
        return "bg-gray-100 text-gray-800"
      case "suspendido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getProjectIcon = (type: string) => {
    switch (type) {
      case "cafe":
        return <Coffee className="w-4 h-4" />
      case "agricultura":
        return <Wheat className="w-4 h-4" />
      case "ganaderia":
        return <Users className="w-4 h-4" />
      case "alternativos":
        return <Leaf className="w-4 h-4" />
      case "apicultura":
        return <Leaf className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  const filteredProyectos = proyectos.filter((proyecto) => {
    const matchesType = selectedType === "todos" || proyecto.type === selectedType
    const matchesSearch =
      proyecto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.location.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Función para centrar el mapa en un proyecto específico
  const centerMapOnProject = (proyecto: typeof proyectos[0]) => {
    setMapCenter([proyecto.coordinates.lat, proyecto.coordinates.lng])
    setSelectedProject(proyecto.id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/user">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mapa de Proyectos</h1>
                <p className="text-sm text-gray-600">Ubicación geográfica de programas productivos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <MapPin className="w-3 h-3 mr-1" />
                {proyectos.length} Proyectos
              </Badge>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{proyectos.length}</p>
                  <p className="text-sm text-gray-600">Proyectos Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{veredas.length}</p>
                  <p className="text-sm text-gray-600">Veredas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(proyectos.reduce((sum, p) => sum + p.progress, 0) / proyectos.length)}%
                  </p>
                  <p className="text-sm text-gray-600">Progreso Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mapa">Vista de Mapa</TabsTrigger>
            <TabsTrigger value="proyectos">Lista de Proyectos</TabsTrigger>
            <TabsTrigger value="veredas">Veredas</TabsTrigger>
          </TabsList>

          {/* Vista de Mapa */}
          <TabsContent value="mapa">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Panel de control - mantener el existente */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar proyecto..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposProyecto.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full ${tipo.color} mr-2`}></div>
                              {tipo.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Leyenda</h4>
                      {tiposProyecto.slice(1).map((tipo) => (
                        <div key={tipo.value} className="flex items-center text-sm">
                          <div className={`w-3 h-3 rounded-full ${tipo.color} mr-2`}></div>
                          <span>{tipo.label}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de proyectos filtrados */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Proyectos ({filteredProyectos.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredProyectos.map((proyecto) => (
                      <div
                        key={proyecto.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProject === proyecto.id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedProject(proyecto.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {getProjectIcon(proyecto.type)}
                              <h4 className="font-medium text-sm text-gray-900 truncate">{proyecto.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{proyecto.location}</p>
                            <div className="flex items-center justify-between">
                              <Badge className={getStatusColor(proyecto.status)} size="sm">
                                {proyecto.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Mapa principal - reemplazar con Leaflet */}
              <div className="lg:col-span-3">
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <CardTitle>Mapa Interactivo</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Layers className="w-4 h-4 mr-2" />
                          Capas
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setMapCenter([5.9189243, -75.5130946994483])}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Centrar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Maximize2 className="w-4 h-4 mr-2" />
                          Pantalla Completa
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px] relative overflow-hidden">
                      {/* Implementación del mapa con Leaflet */}
                      <MapComponent
                        center={mapCenter}
                        zoom={mapZoom}
                        proyectos={filteredProyectos}
                        onProjectSelect={setSelectedProject}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Información del proyecto seleccionado - mantener el existente */}
                {selectedProject && (
                  <Card className="bg-white border border-gray-200 mt-4">
                    <CardContent className="p-6">
                      {(() => {
                        const proyecto = proyectos.find((p) => p.id === selectedProject)
                        if (!proyecto) return null

                        return (
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{proyecto.name}</h3>
                                <p className="text-gray-600">{proyecto.description}</p>
                              </div>
                              <Badge className={getStatusColor(proyecto.status)}>{proyecto.status}</Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-900">Ubicación</p>
                                <p className="text-gray-600">{proyecto.location}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Área</p>
                                <p className="text-gray-600">{proyecto.area}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Familias</p>
                                <p className="text-gray-600">{proyecto.families} familias</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Responsable: {proyecto.responsable}</span>
                                <span>Progreso: {proyecto.progress}%</span>
                              </div>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Lista de Proyectos - mantener el existente */}
          <TabsContent value="proyectos">
            {/* ... existing code ... */}
          </TabsContent>

          {/* Veredas - mantener el existente */}
          <TabsContent value="veredas">
            {/* ... existing code ... */}
          </TabsContent>
        </Tabs>

        {/* Información adicional - mantener el existente */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-emerald-900 mb-2">Funcionalidades del Mapa</h3>
                <div className="text-emerald-800 space-y-2">
                  <p>• Visualiza la ubicación exacta de todos los proyectos productivos</p>
                  <p>• Filtra por tipo de proyecto y estado de ejecución</p>
                  <p>• Obtén información detallada al hacer clic en cada marcador</p>
                  <p>• Descarga mapas en PDF o comparte ubicaciones específicas</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Mapa
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-transparent"
                  >
                    📱 App Móvil
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
