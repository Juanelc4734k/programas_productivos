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
  Settings,
  TrendingUp,
  Shield,
  Activity,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  MoreHorizontal,
  Server,
  MapPin,
  DollarSign,
} from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

const systemStats = [
  {
    title: "Total Usuarios",
    value: "1,847",
    change: "+127",
    icon: Users,
    color: "blue",
    description: "Campesinos y funcionarios",
  },
  {
    title: "Programas Activos",
    value: "24",
    change: "+3",
    icon: TrendingUp,
    color: "emerald",
    description: "En ejecución",
  },
  {
    title: "Presupuesto Total",
    value: "$2.4B",
    change: "+15%",
    icon: DollarSign,
    color: "purple",
    description: "Asignado este año",
  },
  {
    title: "Veredas Activas",
    value: "23/25",
    change: "+2",
    icon: MapPin,
    color: "amber",
    description: "Con programas",
  },
]

const systemHealth = [
  {
    component: "Base de Datos",
    status: "healthy",
    uptime: "99.9%",
    lastCheck: "Hace 2 min",
  },
  {
    component: "Servidor Web",
    status: "healthy",
    uptime: "99.8%",
    lastCheck: "Hace 1 min",
  },
  {
    component: "Sistema de Archivos",
    status: "warning",
    uptime: "98.5%",
    lastCheck: "Hace 5 min",
  },
  {
    component: "Notificaciones",
    status: "healthy",
    uptime: "99.7%",
    lastCheck: "Hace 3 min",
  },
]

const recentUsers = [
  {
    id: 1,
    name: "Carlos Mendoza",
    email: "carlos@email.com",
    type: "Campesino",
    vereda: "El Progreso",
    registered: "2025-01-08",
    status: "pending",
  },
  {
    id: 2,
    name: "Ana Herrera",
    email: "ana.herrera@montebello.gov.co",
    type: "Funcionario",
    department: "Agricultura",
    registered: "2025-01-07",
    status: "approved",
  },
  {
    id: 3,
    name: "Miguel Torres",
    email: "miguel@email.com",
    type: "Campesino",
    vereda: "La Esperanza",
    registered: "2025-01-06",
    status: "active",
  },
]

const programsOverview = [
  {
    id: 1,
    name: "Café Sostenible Regional",
    coordinator: "María González",
    beneficiaries: 245,
    budget: "$450,000,000",
    progress: 78,
    veredas: 8,
    status: "active",
  },
  {
    id: 2,
    name: "Agricultura Familiar Integral",
    coordinator: "Juan Pérez",
    beneficiaries: 189,
    budget: "$320,000,000",
    progress: 65,
    veredas: 6,
    status: "active",
  },
  {
    id: 3,
    name: "Ganadería Sostenible",
    coordinator: "Luis Ramírez",
    beneficiaries: 156,
    budget: "$580,000,000",
    progress: 45,
    veredas: 5,
    status: "active",
  },
]

export default function AdminDashboardPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <RouteGuard allowedRoles={["admin", "funcionario"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header del Administrador */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión - Plataforma Montebello</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Super Admin
                </Badge>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Estadísticas del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {systemStats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center mt-1">
                          <p
                            className={`text-sm ${stat.change.includes("+") || stat.change.includes("%") ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {stat.change} este mes
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

          {/* Estado del Sistema */}
          <Card className="bg-white border border-gray-200 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>Monitoreo en tiempo real de los componentes del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemHealth.map((component, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{component.component}</h4>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status === "healthy"
                          ? "Saludable"
                          : component.status === "warning"
                            ? "Advertencia"
                            : "Error"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Uptime:</span>
                        <span className="font-medium">{component.uptime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Última verificación:</span>
                        <span className="text-gray-500">{component.lastCheck}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contenido principal con tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="programs">Programas</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
              <TabsTrigger value="settings">Configuración</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            {/* Tab de Usuarios */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Gestión de Usuarios
                      </CardTitle>
                      <CardDescription>Administra campesinos, funcionarios y permisos</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input placeholder="Buscar usuarios..." className="pl-10 w-64" />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{user.name}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {user.type}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {user.type === "Campesino" ? user.vereda : user.department}
                                </span>
                                <span className="text-xs text-gray-500">Registrado: {user.registered}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getUserStatusColor(user.status)}>
                              {user.status === "active" ? "Activo" : user.status === "pending" ? "Pendiente" : "Aprobado"}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
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

            {/* Tab de Programas */}
            <TabsContent value="programs" className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Supervisión de Programas
                      </CardTitle>
                      <CardDescription>Vista general de todos los programas del municipio</CardDescription>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Programa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {programsOverview.map((program) => (
                      <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
                            <p className="text-sm text-gray-600">Coordinador: {program.coordinator}</p>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Activo
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Beneficiarios</p>
                            <p className="text-2xl font-bold text-gray-900">{program.beneficiaries}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                            <p className="text-lg font-semibold text-gray-900">{program.budget}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Veredas</p>
                            <p className="text-2xl font-bold text-gray-900">{program.veredas}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Progreso</p>
                            <div className="mt-1">
                              <Progress value={program.progress} className="h-2" />
                              <p className="text-sm text-gray-600 mt-1">{program.progress}%</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Eye className="w-4 h-4 mr-2" />
                            Detalles
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Reporte
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Configurar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Otros tabs con contenido placeholder */}
            <TabsContent value="system">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="w-5 h-5 mr-2" />
                    Configuración del Sistema
                  </CardTitle>
                  <CardDescription>Ajustes avanzados y configuración técnica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Server className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Panel de Sistema</h3>
                    <p className="text-gray-600">Configuración avanzada del sistema</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Reportes Ejecutivos
                  </CardTitle>
                  <CardDescription>Análisis y reportes para la toma de decisiones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Centro de Reportes</h3>
                    <p className="text-gray-600">Genera reportes ejecutivos y análisis detallados</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Configuración General
                  </CardTitle>
                  <CardDescription>Ajustes generales de la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Panel de Configuración</h3>
                    <p className="text-gray-600">Personaliza la plataforma según las necesidades</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Logs del Sistema
                  </CardTitle>
                  <CardDescription>Registro de actividades y eventos del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Registro de Actividades</h3>
                    <p className="text-gray-600">Monitorea todas las actividades del sistema</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RouteGuard>
  )
}
