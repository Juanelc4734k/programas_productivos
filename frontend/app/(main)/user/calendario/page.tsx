"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Bell,
  Eye,
  GraduationCap,
  Handshake,
  Megaphone,
} from "lucide-react"
import Link from "next/link"

const eventos = [
  {
    id: 1,
    title: "Capacitación: Manejo Sostenible del Café",
    description: "Taller práctico sobre técnicas sostenibles para el cultivo de café",
    type: "capacitacion",
    date: "2025-01-15",
    startTime: "08:00",
    endTime: "17:00",
    location: "Salón Comunal El Progreso",
    organizer: "Secretaría de Agricultura",
    participants: 30,
    maxParticipants: 35,
    status: "confirmado",
    category: "Café",
    priority: "alta",
    contact: "ing.mendoza@montebello.gov.co",
  },
  {
    id: 2,
    title: "Reunión: Comité de Caficultores",
    description: "Reunión mensual para revisar avances del programa de café sostenible",
    type: "reunion",
    date: "2025-01-18",
    startTime: "14:00",
    endTime: "16:00",
    location: "Alcaldía Municipal - Sala de Juntas",
    organizer: "Comité de Caficultores",
    participants: 12,
    maxParticipants: 15,
    status: "confirmado",
    category: "Café",
    priority: "media",
    contact: "comite.cafe@montebello.gov.co",
  },
  {
    id: 3,
    title: "Entrega de Insumos: Programa Agricultura Familiar",
    description: "Distribución de semillas y herramientas para beneficiarios del programa",
    type: "entrega",
    date: "2025-01-20",
    startTime: "09:00",
    endTime: "12:00",
    location: "Centro de Acopio La Esperanza",
    organizer: "Programa Agricultura Familiar",
    participants: 45,
    maxParticipants: 50,
    status: "confirmado",
    category: "Agricultura",
    priority: "alta",
    contact: "agricultura@montebello.gov.co",
  },
  {
    id: 4,
    title: "Feria Campesina: Productos Locales",
    description: "Feria para promocionar y comercializar productos agrícolas locales",
    type: "evento",
    date: "2025-01-25",
    startTime: "07:00",
    endTime: "15:00",
    location: "Parque Principal Montebello",
    organizer: "Alcaldía Municipal",
    participants: 200,
    maxParticipants: 300,
    status: "confirmado",
    category: "Comercialización",
    priority: "alta",
    contact: "eventos@montebello.gov.co",
  },
  {
    id: 5,
    title: "Visita Técnica: Sistemas Silvopastoriles",
    description: "Visita a finca demostrativa para conocer sistemas ganaderos sostenibles",
    type: "visita",
    date: "2025-01-28",
    startTime: "08:00",
    endTime: "16:00",
    location: "Finca Demostrativa San José",
    organizer: "Programa Ganadería Sostenible",
    participants: 20,
    maxParticipants: 25,
    status: "confirmado",
    category: "Ganadería",
    priority: "media",
    contact: "ganaderia@montebello.gov.co",
  },
  {
    id: 6,
    title: "Taller: Tecnologías Digitales Agrícolas",
    description: "Capacitación en uso de aplicaciones móviles para agricultura",
    type: "capacitacion",
    date: "2025-02-01",
    startTime: "14:00",
    endTime: "18:00",
    location: "Virtual - Plataforma Zoom",
    organizer: "Programa Innovación Rural",
    participants: 35,
    maxParticipants: 50,
    status: "confirmado",
    category: "Tecnología",
    priority: "media",
    contact: "innovacion@montebello.gov.co",
  },
  {
    id: 7,
    title: "Asamblea: Asociación de Productores",
    description: "Asamblea general de la asociación de productores rurales",
    type: "reunion",
    date: "2025-02-05",
    startTime: "09:00",
    endTime: "12:00",
    location: "Salón Comunal El Mirador",
    organizer: "Asociación de Productores",
    participants: 80,
    maxParticipants: 100,
    status: "tentativo",
    category: "Asociativo",
    priority: "alta",
    contact: "asociacion@montebello.gov.co",
  },
]

const tiposEvento = [
  { value: "todos", label: "Todos los eventos", icon: Calendar },
  { value: "capacitacion", label: "Capacitaciones", icon: GraduationCap },
  { value: "reunion", label: "Reuniones", icon: Users },
  { value: "entrega", label: "Entregas", icon: Handshake },
  { value: "evento", label: "Eventos", icon: Megaphone },
  { value: "visita", label: "Visitas Técnicas", icon: Eye },
]

const categorias = ["Todas", "Café", "Agricultura", "Ganadería", "Tecnología", "Comercialización", "Asociativo"]

export default function CalendarioPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState("mes")
  const [selectedType, setSelectedType] = useState("todos")
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "capacitacion":
        return "bg-purple-100 text-purple-800"
      case "reunion":
        return "bg-blue-100 text-blue-800"
      case "entrega":
        return "bg-emerald-100 text-emerald-800"
      case "evento":
        return "bg-amber-100 text-amber-800"
      case "visita":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-emerald-100 text-emerald-800"
      case "tentativo":
        return "bg-yellow-100 text-yellow-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta":
        return "border-l-red-500"
      case "media":
        return "border-l-yellow-500"
      case "baja":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const filteredEventos = eventos.filter((evento) => {
    const matchesType = selectedType === "todos" || evento.type === selectedType
    const matchesCategory = selectedCategory === "Todas" || evento.category === selectedCategory
    return matchesType && matchesCategory
  })

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }

    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false })
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return filteredEventos.filter((evento) => evento.date === dateString)
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  // Funciones para la vista semanal
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const getWeekRange = (date: Date) => {
    const weekDays = getWeekDays(date)
    const startDate = weekDays[0]
    const endDate = weekDays[6]
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()} - ${endDate.getDate()} de ${startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
    } else {
      return `${startDate.getDate()} ${startDate.toLocaleDateString('es-ES', { month: 'short' })} - ${endDate.getDate()} ${endDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`
    }
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
                <h1 className="text-xl font-semibold text-gray-900">Calendario de Eventos</h1>
                <p className="text-sm text-gray-600">Programación de actividades y eventos rurales</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Calendar className="w-3 h-3 mr-1" />
                {eventos.length} Eventos
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{eventos.length}</p>
                  <p className="text-sm text-gray-600">Eventos Totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventos.filter((e) => e.type === "capacitacion").length}
                  </p>
                  <p className="text-sm text-gray-600">Capacitaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventos.reduce((sum, e) => sum + e.participants, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Participantes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                  <Bell className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventos.filter((e) => e.priority === "alta").length}
                  </p>
                  <p className="text-sm text-gray-600">Alta Prioridad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposEvento.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center">
                          <tipo.icon className="w-4 h-4 mr-2" />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mes">Vista Mensual</TabsTrigger>
            <TabsTrigger value="semana">Vista Semanal</TabsTrigger>
            <TabsTrigger value="lista">Vista Lista</TabsTrigger>
          </TabsList>

          {/* Vista Mensual */}
          <TabsContent value="mes">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl capitalize">{getMonthName(currentDate)}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Hoy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                    <div
                      key={day}
                      className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayEvents = getEventsForDate(day.date)
                    const isToday = day.date.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={index}
                        className={`min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0 ${
                          !day.isCurrentMonth ? "bg-gray-50" : "bg-white"
                        } ${isToday ? "bg-blue-50" : ""}`}
                      >
                        <div
                          className={`text-sm font-medium mb-1 ${
                            !day.isCurrentMonth ? "text-gray-400" : isToday ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((evento) => (
                            <div
                              key={evento.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getEventTypeColor(evento.type)}`}
                              title={evento.title}
                            >
                              {evento.startTime} - {evento.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 font-medium">+{dayEvents.length - 3} más</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vista Lista */}
          <TabsContent value="lista">
            <div className="space-y-4">
              {filteredEventos.map((evento) => (
                <Card
                  key={evento.id}
                  className={`bg-white border border-gray-200 hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(evento.priority)}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{evento.title}</h3>
                          <Badge className={getEventTypeColor(evento.type)}>
                            {tiposEvento.find((t) => t.value === evento.type)?.label || evento.type}
                          </Badge>
                          <Badge className={getStatusColor(evento.status)}>{evento.status}</Badge>
                        </div>

                        <p className="text-gray-600 mb-4">{evento.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(evento.date).toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {evento.startTime} - {evento.endTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="truncate">{evento.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {evento.participants}/{evento.maxParticipants} participantes
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Organiza: {evento.organizer}</span>
                            <span>Categoría: {evento.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalles
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Bell className="w-4 h-4 mr-2" />
                              Recordatorio
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredEventos.length === 0 && (
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
                    <p className="text-gray-600">No se encontraron eventos con los filtros seleccionados</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Vista Semanal */}
          <TabsContent value="semana">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{getWeekRange(currentDate)}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Hoy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day, index) => {
                    const weekDays = getWeekDays(currentDate)
                    const dayDate = weekDays[index]
                    const isToday = dayDate.toDateString() === new Date().toDateString()
                    
                    return (
                      <div
                        key={day}
                        className="p-4 text-center border-r border-gray-200 last:border-r-0"
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                          {day}
                        </div>
                        <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {dayDate.getDate()}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {dayDate.toLocaleDateString('es-ES', { month: 'short' })}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-7 min-h-[400px]">
                  {getWeekDays(currentDate).map((day, index) => {
                    const dayEvents = getEventsForDate(day)
                    const isToday = day.toDateString() === new Date().toDateString()
                    
                    return (
                      <div
                        key={index}
                        className={`p-3 border-r border-gray-200 last:border-r-0 ${isToday ? 'bg-blue-50' : 'bg-white'}`}
                      >
                        <div className="space-y-2">
                          {dayEvents.map((evento) => (
                            <div
                              key={evento.id}
                              className={`text-xs p-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-l-2 ${getPriorityColor(evento.priority)} ${getEventTypeColor(evento.type)}`}
                              title={`${evento.title} - ${evento.startTime} a ${evento.endTime}`}
                            >
                              <div className="font-medium truncate">{evento.title}</div>
                              <div className="flex items-center text-xs opacity-75 mt-1">
                                <Clock className="w-3 h-3 mr-1" />
                                {evento.startTime} - {evento.endTime}
                              </div>
                              <div className="flex items-center text-xs opacity-75 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="truncate">{evento.location}</span>
                              </div>
                            </div>
                          ))}
                          {dayEvents.length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-4">
                              Sin eventos
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Recordatorios y Notificaciones</h3>
                <div className="text-blue-800 space-y-2">
                  <p>• Recibe notificaciones automáticas 24 horas antes de cada evento</p>
                  <p>• Confirma tu asistencia para eventos con cupos limitados</p>
                  <p>• Descarga el calendario en formato PDF o sincroniza con tu calendario personal</p>
                  <p>• Contacta directamente a los organizadores para más información</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    📧 Suscribirse a Notificaciones
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    📅 Sincronizar Calendario
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
