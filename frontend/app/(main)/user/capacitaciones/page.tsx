"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  ArrowLeft,
  Play,
  Download,
  CheckCircle,
  BookOpen,
  Video,
  FileText,
  Award,
  Star,
  User,
  AlertCircle,
  Eye,
} from "lucide-react"
import Link from "next/link"

const capacitaciones = [
  {
    id: 1,
    title: "Manejo Sostenible del Café",
    description: "Aprende técnicas modernas para el cultivo sostenible de café, desde la siembra hasta la cosecha",
    type: "workshop",
    category: "Café",
    instructor: "Ing. Carlos Mendoza",
    duration: 8,
    maxParticipants: 30,
    enrolled: 24,
    startDate: "2025-01-15",
    endDate: "2025-01-15",
    startTime: "08:00",
    endTime: "17:00",
    location: "Salón Comunal El Progreso",
    status: "open",
    price: "Gratuito",
    level: "Intermedio",
    rating: 4.8,
    reviews: 45,
    image: "/placeholder.svg?height=200&width=300",
    topics: [
      "Variedades de café resistentes",
      "Técnicas de siembra y trasplante",
      "Manejo integrado de plagas",
      "Fertilización orgánica",
      "Cosecha y beneficio",
    ],
    requirements: [
      "Tener cultivo de café o interés en iniciarlo",
      "Experiencia básica en agricultura",
      "Disponibilidad completa el día del taller",
    ],
    materials: ["Manual técnico", "Kit de herramientas básicas", "Certificado de participación"],
  },
  {
    id: 2,
    title: "Diversificación de Cultivos",
    description: "Estrategias para diversificar la producción agrícola y reducir riesgos económicos",
    type: "course",
    category: "Agricultura",
    instructor: "Ing. Ana Herrera",
    duration: 16,
    maxParticipants: 25,
    enrolled: 18,
    startDate: "2025-01-20",
    endDate: "2025-01-21",
    startTime: "08:00",
    endTime: "17:00",
    location: "Centro de Capacitación Municipal",
    status: "open",
    price: "Gratuito",
    level: "Básico",
    rating: 4.6,
    reviews: 32,
    image: "/placeholder.svg?height=200&width=300",
    topics: [
      "Análisis de mercado local",
      "Selección de cultivos alternativos",
      "Rotación y asociación de cultivos",
      "Comercialización directa",
      "Gestión financiera agrícola",
    ],
    requirements: ["Ser agricultor activo", "Interés en diversificar cultivos", "Participación en ambos días"],
    materials: ["Guía de cultivos alternativos", "Planillas de costos", "Certificado de finalización"],
  },
  {
    id: 3,
    title: "Sistemas Silvopastoriles",
    description: "Implementación de sistemas ganaderos sostenibles que integran árboles, pastos y ganado",
    type: "workshop",
    category: "Ganadería",
    instructor: "Dr. Miguel Torres",
    duration: 6,
    maxParticipants: 20,
    enrolled: 15,
    startDate: "2025-01-25",
    endDate: "2025-01-25",
    startTime: "09:00",
    endTime: "16:00",
    location: "Finca Demostrativa San José",
    status: "open",
    price: "Gratuito",
    level: "Intermedio",
    rating: 4.9,
    reviews: 28,
    image: "/placeholder.svg?height=200&width=300",
    topics: [
      "Diseño de sistemas silvopastoriles",
      "Selección de especies arbóreas",
      "Manejo de pasturas mejoradas",
      "Bienestar animal",
      "Beneficios ambientales",
    ],
    requirements: ["Tener ganado bovino", "Mínimo 3 hectáreas de pastoreo", "Transporte propio a la finca"],
    materials: ["Manual silvopastoril", "Plántulas para establecimiento", "Certificado técnico"],
  },
  {
    id: 4,
    title: "Tecnologías Digitales para el Campo",
    description: "Uso de aplicaciones móviles y herramientas digitales para mejorar la productividad agrícola",
    type: "video",
    category: "Tecnología",
    instructor: "Ing. Laura Gómez",
    duration: 4,
    maxParticipants: 50,
    enrolled: 35,
    startDate: "2025-02-01",
    endDate: "2025-02-01",
    startTime: "14:00",
    endTime: "18:00",
    location: "Virtual - Plataforma Zoom",
    status: "open",
    price: "Gratuito",
    level: "Básico",
    rating: 4.4,
    reviews: 18,
    image: "/placeholder.svg?height=200&width=300",
    topics: [
      "Apps para clima y pronósticos",
      "Registro digital de cultivos",
      "Calculadoras de fertilización",
      "Plataformas de comercialización",
      "Redes sociales para agricultores",
    ],
    requirements: ["Tener smartphone o tablet", "Conexión a internet estable", "Conocimientos básicos de tecnología"],
    materials: ["Lista de aplicaciones recomendadas", "Guía de uso", "Certificado digital"],
  },
]

const misCapacitaciones = [
  {
    id: 1,
    title: "Manejo Sostenible del Café",
    status: "enrolled",
    enrollDate: "2025-01-08",
    startDate: "2025-01-15",
    progress: 0,
    instructor: "Ing. Carlos Mendoza",
    location: "Salón Comunal El Progreso",
  },
  {
    id: 2,
    title: "Control Integrado de Plagas",
    status: "completed",
    enrollDate: "2024-11-15",
    startDate: "2024-12-01",
    progress: 100,
    instructor: "Dr. Patricia Ruiz",
    location: "Centro de Capacitación",
    grade: 95,
    certificate: "CERT-2024-089",
  },
  {
    id: 3,
    title: "Comercialización Agrícola",
    status: "in_progress",
    enrollDate: "2024-12-10",
    startDate: "2024-12-15",
    progress: 75,
    instructor: "Lic. Roberto Silva",
    location: "Virtual",
  },
]

const categories = ["Todas", "Café", "Agricultura", "Ganadería", "Tecnología", "Comercialización", "Sostenibilidad"]
const levels = ["Todos", "Básico", "Intermedio", "Avanzado"]
const types = ["Todos", "workshop", "course", "video", "document"]

export default function CapacitacionesPage() {
  const [activeTab, setActiveTab] = useState("disponibles")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [selectedLevel, setSelectedLevel] = useState("Todos")
  const [selectedType, setSelectedType] = useState("Todos")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-100 text-emerald-800"
      case "full":
        return "bg-red-100 text-red-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "enrolled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Inscripciones Abiertas"
      case "full":
        return "Cupos Llenos"
      case "closed":
        return "Cerrado"
      case "enrolled":
        return "Inscrito"
      case "completed":
        return "Completado"
      case "in_progress":
        return "En Progreso"
      default:
        return "Desconocido"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "workshop":
        return <GraduationCap className="w-4 h-4" />
      case "course":
        return <BookOpen className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "document":
        return <FileText className="w-4 h-4" />
      default:
        return <GraduationCap className="w-4 h-4" />
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "workshop":
        return "Taller"
      case "course":
        return "Curso"
      case "video":
        return "Video"
      case "document":
        return "Documento"
      default:
        return "Capacitación"
    }
  }

  const filteredCapacitaciones = capacitaciones.filter((capacitacion) => {
    const matchesSearch =
      capacitacion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capacitacion.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capacitacion.instructor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "Todas" || capacitacion.category === selectedCategory
    const matchesLevel = selectedLevel === "Todos" || capacitacion.level === selectedLevel
    const matchesType = selectedType === "Todos" || capacitacion.type === selectedType

    return matchesSearch && matchesCategory && matchesLevel && matchesType
  })

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
                <h1 className="text-xl font-semibold text-gray-900">Capacitaciones</h1>
                <p className="text-sm text-gray-600">Fortalece tus conocimientos y habilidades</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <GraduationCap className="w-3 h-3 mr-1" />
                {capacitaciones.length} Disponibles
              </Badge>
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
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{capacitaciones.length}</p>
                  <p className="text-sm text-gray-600">Capacitaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {misCapacitaciones.filter((cap) => cap.status === "completed").length}
                  </p>
                  <p className="text-sm text-gray-600">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {capacitaciones.reduce((sum, cap) => sum + cap.duration, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Horas Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disponibles">Capacitaciones Disponibles</TabsTrigger>
            <TabsTrigger value="mis-capacitaciones">Mis Capacitaciones</TabsTrigger>
          </TabsList>

          {/* Tab de capacitaciones disponibles */}
          <TabsContent value="disponibles" className="space-y-6">
            {/* Filtros */}
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar capacitaciones..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "Todos" ? "Todos" : getTypeText(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de capacitaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCapacitaciones.map((capacitacion) => (
                <Card
                  key={capacitacion.id}
                  className="bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 rounded-t-lg relative overflow-hidden">
                    <img
                      src={capacitacion.image || "/placeholder.svg"}
                      alt={capacitacion.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white text-gray-900">
                        {getTypeIcon(capacitacion.type)}
                        <span className="ml-1">{getTypeText(capacitacion.type)}</span>
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className={getStatusColor(capacitacion.status)}>
                        {getStatusText(capacitacion.status)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{capacitacion.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">{capacitacion.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {capacitacion.instructor}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-500" />
                        {capacitacion.rating} ({capacitacion.reviews})
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {capacitacion.duration} horas
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {capacitacion.enrolled}/{capacitacion.maxParticipants}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(capacitacion.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{capacitacion.location}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cupos disponibles</span>
                        <span>
                          {capacitacion.maxParticipants - capacitacion.enrolled} de {capacitacion.maxParticipants}
                        </span>
                      </div>
                      <Progress value={(capacitacion.enrolled / capacitacion.maxParticipants) * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{capacitacion.category}</Badge>
                        <Badge variant="outline">{capacitacion.level}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={capacitacion.status === "full" || capacitacion.status === "closed"}
                        >
                          Inscribirse
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCapacitaciones.length === 0 && (
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-12 text-center">
                  <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron capacitaciones</h3>
                  <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab de mis capacitaciones */}
          <TabsContent value="mis-capacitaciones" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Mi Historial de Capacitaciones
                </CardTitle>
                <CardDescription>Revisa tu progreso y certificados obtenidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {misCapacitaciones.map((capacitacion) => (
                    <Card key={capacitacion.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{capacitacion.title}</h3>
                              <Badge className={getStatusColor(capacitacion.status)}>
                                {getStatusText(capacitacion.status)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {capacitacion.instructor}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Inicio: {new Date(capacitacion.startDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {capacitacion.location}
                              </div>
                            </div>

                            {capacitacion.status === "in_progress" && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progreso</span>
                                  <span>{capacitacion.progress}%</span>
                                </div>
                                <Progress value={capacitacion.progress} className="h-2" />
                              </div>
                            )}

                            {capacitacion.status === "completed" && (
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <Award className="w-3 h-3 mr-1 text-emerald-600" />
                                  Calificación: {capacitacion.grade}/100
                                </div>
                                <div className="flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                                  Certificado: {capacitacion.certificate}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {capacitacion.status === "completed" && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Certificado
                              </Button>
                            )}
                            {capacitacion.status === "in_progress" && (
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Play className="w-4 h-4 mr-2" />
                                Continuar
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {misCapacitaciones.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes capacitaciones</h3>
                      <p className="text-gray-600 mb-4">Inscríbete a tu primera capacitación</p>
                      <Button
                        onClick={() => setActiveTab("disponibles")}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        Ver Capacitaciones
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900 mb-2">Información Importante</h3>
                <div className="text-purple-800 space-y-2">
                  <p>• Las capacitaciones son completamente gratuitas para todos los campesinos del municipio</p>
                  <p>• Se otorgan certificados de participación y finalización</p>
                  <p>• Incluyen materiales, refrigerios y herramientas básicas</p>
                  <p>• Para capacitaciones presenciales, confirma tu asistencia 24 horas antes</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
                  >
                    📞 Información: (123) 456-7890
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 bg-transparent"
                  >
                    📧 capacitaciones@montebello.gov.co
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
