"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  MapPin,
  Phone,
  MoreHorizontal,
} from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import BeneficiariesManagement from "@/components/beneficiaries-management"

const stats = [
  {
    title: "Beneficiarios Asignados",
    value: "156",
    change: "+12",
    icon: Users,
    color: "emerald",
    description: "En mis programas",
  },
  {
    title: "Trámites Pendientes",
    value: "23",
    change: "-5",
    icon: FileText,
    color: "amber",
    description: "Requieren revisión",
  },
  {
    title: "Programas Activos",
    value: "8",
    change: "+2",
    icon: TrendingUp,
    color: "blue",
    description: "Bajo mi supervisión",
  },
  {
    title: "Visitas Programadas",
    value: "12",
    change: "+4",
    icon: Calendar,
    color: "purple",
    description: "Esta semana",
  },
]

const pendingProcedures = [
  {
    id: 1,
    farmer: "José Martínez",
    type: "Solicitud de Insumos",
    date: "2025-01-08",
    priority: "high",
    description: "Solicita 500 plántulas de café variedad Castillo",
    vereda: "El Progreso",
    phone: "300-123-4567",
  },
  {
    id: 2,
    farmer: "Ana López",
    type: "Asistencia Técnica",
    date: "2025-01-07",
    priority: "medium",
    description: "Requiere asesoría para control de broca del café",
    vereda: "La Esperanza",
    phone: "300-234-5678",
  },
  {
    id: 3,
    farmer: "Pedro Ramírez",
    type: "Inscripción a Programa",
    date: "2025-01-06",
    priority: "medium",
    description: "Desea inscribirse al programa de ganadería sostenible",
    vereda: "San José",
    phone: "300-345-6789",
  },
]

const myPrograms = [
  {
    id: 1,
    name: "Café Sostenible - El Progreso",
    beneficiaries: 45,
    progress: 75,
    budget: "$120,000,000",
    used: "$90,000,000",
    nextActivity: "Capacitación - 15 Enero",
    status: "En progreso",
  },
  {
    id: 2,
    name: "Agricultura Familiar - La Esperanza",
    beneficiaries: 32,
    progress: 60,
    budget: "$85,000,000",
    used: "$51,000,000",
    nextActivity: "Entrega insumos - 20 Enero",
    status: "En progreso",
  },
  {
    id: 3,
    name: "Huertos Urbanos - Centro",
    beneficiaries: 28,
    progress: 40,
    budget: "$45,000,000",
    used: "$18,000,000",
    nextActivity: "Visita técnica - 18 Enero",
    status: "Iniciando",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "approval",
    message: "Aprobaste la solicitud de insumos de María González",
    time: "Hace 2 horas",
    icon: CheckCircle,
    color: "text-emerald-600",
  },
  {
    id: 2,
    type: "visit",
    message: "Completaste visita técnica en Finca La Esperanza",
    time: "Hace 4 horas",
    icon: MapPin,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "training",
    message: "Programaste capacitación sobre manejo de café",
    time: "Ayer",
    icon: Calendar,
    color: "text-purple-600",
  },
]

export default function FuncionarioPage() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <RouteGuard allowedRoles={['funcionario']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header del Funcionario */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel del Funcionario</h1>
                <p className="text-sm text-gray-600">María González - Secretaría de Agricultura</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Funcionario Activo
                </Badge>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Calendar className="w-4 h-4 mr-2" />
                  Nueva Actividad
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-1">
                          <p className={`text-sm ${stat.change.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                            {stat.change} esta semana
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </div>
                      <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Contenido principal con tabs */}
          <Tabs defaultValue="procedures" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="procedures">Trámites</TabsTrigger>
              <TabsTrigger value="programs">Mis Programas</TabsTrigger>
              <TabsTrigger value="beneficiaries">Beneficiarios</TabsTrigger>
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
            </TabsList>

            {/* Tab de Trámites */}
            <TabsContent value="procedures" className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Trámites Pendientes
                      </CardTitle>
                      <CardDescription>Solicitudes que requieren tu revisión</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Buscar trámites..." className="pl-10 w-64" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {pendingProcedures.map((procedure) => (
                      <div
                        key={procedure.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{procedure.farmer}</h3>
                              <Badge className={getPriorityColor(procedure.priority)}>
                                {procedure.priority === "high"
                                  ? "Urgente"
                                  : procedure.priority === "medium"
                                    ? "Medio"
                                    : "Bajo"}
                              </Badge>
                              <span className="text-sm text-gray-500">{procedure.date}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{procedure.type}</p>
                            <p className="text-sm text-gray-600 mb-2">{procedure.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {procedure.vereda}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {procedure.phone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Eye className="w-4 h-4 mr-2" />
                              Revisar
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Contactar
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Mis Programas */}
            <TabsContent value="programs" className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Programas Bajo Mi Supervisión
                  </CardTitle>
                  <CardDescription>Seguimiento y gestión de programas asignados</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {myPrograms.map((program) => (
                      <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {program.beneficiaries} beneficiarios
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {program.nextActivity}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {program.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Progreso General</p>
                            <div className="mt-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">{program.progress}% completado</span>
                              </div>
                              <Progress value={program.progress} className="h-2" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                            <p className="text-lg font-semibold text-gray-900">{program.budget}</p>
                            <p className="text-sm text-gray-600">Ejecutado: {program.used}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Próxima Actividad</p>
                            <p className="text-sm text-gray-900">{program.nextActivity}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                          <Button size="sm" variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            Beneficiarios
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Reporte
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Beneficiarios */}
            <TabsContent value="beneficiaries">
              <BeneficiariesManagement 
                programId="687523bd85afb9660e658e7d" 
                programName="Programa de Desarrollo Rural"
              />
            </TabsContent>

            {/* Tab de Calendario */}
            <TabsContent value="calendar">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Calendario de Actividades
                  </CardTitle>
                  <CardDescription>Programa y gestiona tus actividades de campo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Calendario Integrado</h3>
                    <p className="text-gray-600 mb-4">Organiza visitas, capacitaciones y seguimientos</p>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">Abrir Calendario</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Reportes */}
            <TabsContent value="reports">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Reportes y Estadísticas
                  </CardTitle>
                  <CardDescription>Genera reportes detallados de tus programas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Reportes</h3>
                    <p className="text-gray-600 mb-4">Analiza el desempeño y progreso de tus programas</p>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Generar Reporte</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actividades Recientes */}
          <Card className="bg-white border border-gray-200 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Actividades Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className={`w-5 h-5 ${activity.color}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RouteGuard>
  )
}
