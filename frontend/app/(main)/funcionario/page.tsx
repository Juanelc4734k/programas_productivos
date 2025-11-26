"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
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
import { fetchPrograms } from "@/services/programs.service"
import type { Program } from "@/types/programs"
import { useAuthContext } from "@/contexts/auth-context"
import { fetchProgramById } from "@/services/programs.service"
import { tramitesService } from "@/services/tramite.service"
import type { TramiteItem } from "@/types/tramites"
import { useRouter } from "next/navigation"
import { beneficiariesService } from "@/services/beneficiaries.service"
import { eventsService } from "@/services/events.service"
import { reportsService } from "@/services/reports.service"
import { activitiesService } from "@/services/activities.service"

type StatColor = "emerald" | "amber" | "blue" | "purple"

interface DashboardStatItem {
  title: string
  value: number | string
  change?: string
  icon: any
  color: StatColor
  description: string
  ariaLabel: string
}

function validateStatItem(item: DashboardStatItem): DashboardStatItem {
  const safeTitle = typeof item.title === "string" ? item.title : "Estadística"
  const safeValue = typeof item.value === "number" || typeof item.value === "string" ? item.value : "N/D"
  const safeDesc = typeof item.description === "string" ? item.description : ""
  const safeColor: StatColor = ["emerald","amber","blue","purple"].includes(item.color) ? item.color : "blue"
  return { ...item, title: safeTitle, value: safeValue, description: safeDesc, color: safeColor }
}

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

function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)
  } catch {
    return `$${value}`
  }
}

const activityIconFor = (type: string) => {
  if (type === 'event_created') return Calendar
  if (type === 'event_updated') return Calendar
  if (type === 'event_deleted') return Calendar
  return CheckCircle
}

export default function FuncionarioPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [activeTab, setActiveTab] = useState<string>("procedures")
  const [programs, setPrograms] = useState<Program[]>([])
  const [programsLoaded, setProgramsLoaded] = useState(false)
  const [programsLoading, setProgramsLoading] = useState(false)
  const [programsError, setProgramsError] = useState<string | null>(null)
  const [statsItems, setStatsItems] = useState<DashboardStatItem[]>([])
  const [procedures, setProcedures] = useState<TramiteItem[]>([])
  const [proceduresLoaded, setProceduresLoaded] = useState(false)
  const [proceduresLoading, setProceduresLoading] = useState(false)
  const [proceduresError, setProceduresError] = useState<string | null>(null)
  const [procedureSearch, setProcedureSearch] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState<string>("all")
  const [selectedProgramName, setSelectedProgramName] = useState<string>("Todos los Programas")
  const [exportingId, setExportingId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [programDetailsLoading, setProgramDetailsLoading] = useState(false)
  const [programDetailsError, setProgramDetailsError] = useState<string | null>(null)
  const [programDetails, setProgramDetails] = useState<Program | null>(null)
  const [calendarView, setCalendarView] = useState<'month'|'week'|'day'>('month')
  const [calendarDate, setCalendarDate] = useState<string>(new Date().toISOString())
  const [events, setEvents] = useState<any[]>([])
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventForm, setEventForm] = useState({ title: '', description: '', start: '', end: '' })
  const [eventEditingId, setEventEditingId] = useState<string | null>(null)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'overview'>('overview')
  const [reportFrom, setReportFrom] = useState<string>('')
  const [reportTo, setReportTo] = useState<string>('')
  const [reportSearch, setReportSearch] = useState<string>('')
  const [reportPreview, setReportPreview] = useState<any | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === "programs" && !programsLoaded && !programsLoading) {
      (async () => {
        try {
          setProgramsLoading(true)
          setProgramsError(null)
          const all = await fetchPrograms()
          const supervised = user?._id ? all.filter(p => p.responsable && (p.responsable as any)._id === user._id) : all
          setPrograms(supervised)
          setProgramsLoaded(true)
        } catch (err: any) {
          setProgramsError(err?.message || "Error al cargar programas")
        } finally {
          setProgramsLoading(false)
        }
      })()
    }
  }, [activeTab, user])

  useEffect(() => {
    if (!programsLoaded && !programsLoading) {
      (async () => {
        try {
          setProgramsLoading(true)
          setProgramsError(null)
          const all = await fetchPrograms()
          const supervised = user?._id ? all.filter(p => p.responsable && (p.responsable as any)._id === user._id) : all
          setPrograms(supervised)
          setProgramsLoaded(true)
        } catch (err: any) {
          setProgramsError(err?.message || "Error al cargar programas")
        } finally {
          setProgramsLoading(false)
        }
      })()
    }
  }, [user])

  useEffect(() => {
    if (activeTab === "procedures" && !proceduresLoaded && !proceduresLoading) {
      (async () => {
        try {
          setProceduresLoading(true)
          setProceduresError(null)
          const list = await tramitesService.listarPublicos()
          const pending = (Array.isArray(list) ? list : []) as TramiteItem[]
          const onlyPending = pending.filter(t => t && (t.estado === 'submitted' || t.estado === 'in_review'))
          setProcedures(onlyPending)
          setProceduresLoaded(true)
        } catch (err: any) {
          setProceduresError(err?.message || 'Error al cargar trámites')
        } finally {
          setProceduresLoading(false)
        }
      })()
    }
  }, [activeTab])

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsError(null)
        const base = new Date(calendarDate)
        const from = new Date(base.getFullYear(), base.getMonth(), 1)
        const to = new Date(base.getFullYear(), base.getMonth() + 1, 0)
        const data = await eventsService.list({ from: from.toISOString(), to: to.toISOString() })
        setEvents(data)
      } catch (err: any) {
        setEventsError(err?.message || 'Error al cargar eventos')
      }
    }
    if (activeTab === 'calendar') loadEvents()
  }, [activeTab, calendarDate])

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await activitiesService.list(10)
        setActivities(data)
      } catch {}
    }
    loadActivities()
  }, [])

  const startOfMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }
  const endOfMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    return new Date(d.getFullYear(), d.getMonth() + 1, 0)
  }
  const monthGrid = (dateStr: string) => {
    const start = startOfMonth(dateStr)
    const end = endOfMonth(dateStr)
    const firstWeekDay = start.getDay() === 0 ? 7 : start.getDay()
    const daysInMonth = end.getDate()
    const cells = [] as Date[]
    const startOffset = firstWeekDay - 1
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
    for (let i = 0; i < totalCells; i++) {
      const day = new Date(start)
      day.setDate(1 + i - startOffset)
      cells.push(day)
    }
    return cells
  }

  const eventsForDay = (day: Date) => {
    const y = day.getFullYear(), m = day.getMonth(), d = day.getDate()
    return events.filter((ev) => {
      const sd = new Date(ev.start)
      return sd.getFullYear() === y && sd.getMonth() === m && sd.getDate() === d
    })
  }

  const prevPeriod = () => {
    const d = new Date(calendarDate)
    if (calendarView === 'month') d.setMonth(d.getMonth() - 1)
    else if (calendarView === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCalendarDate(d.toISOString())
  }
  const nextPeriod = () => {
    const d = new Date(calendarDate)
    if (calendarView === 'month') d.setMonth(d.getMonth() + 1)
    else if (calendarView === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCalendarDate(d.toISOString())
  }
  const formatMonthLabel = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  }

  const openNewEvent = (day?: Date) => {
    const start = day ? new Date(day) : new Date(calendarDate)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    setEventEditingId(null)
    setEventForm({ title: '', description: '', start: start.toISOString(), end: end.toISOString() })
    setEventDialogOpen(true)
  }
  const openEditEvent = (ev: any) => {
    setEventEditingId(ev._id)
    setEventForm({ title: ev.title || '', description: ev.description || '', start: ev.start, end: ev.end })
    setEventDialogOpen(true)
  }
  const saveEvent = async () => {
    if (!eventForm.title) return
    if (eventEditingId) await eventsService.update(eventEditingId, eventForm)
    else await eventsService.create(eventForm)
    setEventDialogOpen(false)
    const d = new Date(calendarDate)
    const from = new Date(d.getFullYear(), d.getMonth(), 1)
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    setEvents(await eventsService.list({ from: from.toISOString(), to: to.toISOString() }))
  }
  const deleteEvent = async () => {
    if (eventEditingId) {
      await eventsService.remove(eventEditingId)
      setEventDialogOpen(false)
      const d = new Date(calendarDate)
      const from = new Date(d.getFullYear(), d.getMonth(), 1)
      const to = new Date(d.getFullYear(), d.getMonth() + 1, 0)
      setEvents(await eventsService.list({ from: from.toISOString(), to: to.toISOString() }))
    }
  }

  const previewReport = async () => {
    try {
      setReportError(null)
      const data = await reportsService.getOverview({ type: reportType, from: reportFrom || undefined, to: reportTo || undefined, search: reportSearch || undefined })
      setReportPreview(data)
    } catch (err: any) {
      setReportError(err?.message || 'Error al obtener reporte')
    }
  }
  const exportReport = async (format: 'csv'|'xls'|'pdf') => {
    try {
      const blob = await reportsService.export({ type: reportType, from: reportFrom || undefined, to: reportTo || undefined, search: reportSearch || undefined, format })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().slice(0,10)
      a.download = `reporte-${reportType}-${date}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setReportError(err?.message || 'Error al exportar reporte')
    }
  }


  const filteredProcedures = useMemo(() => {
    const q = procedureSearch.trim().toLowerCase()
    if (!q) return procedures
    return procedures.filter(p => (
      (p.titulo || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q) ||
      (p.vereda || '').toLowerCase().includes(q)
    ))
  }, [procedures, procedureSearch])

  const supervisedPrograms = useMemo(() => {
    return programs.map(p => ({
      id: p._id,
      name: p.nombre,
      beneficiaries: Array.isArray(p.inscritos) ? p.inscritos.length : 0,
      progress: Number(p.progreso || 0),
      budget: formatCurrency(Number(p.presupuesto || 0)),
      used: formatCurrency(Math.round(Number(p.presupuesto || 0) * Number(p.progreso || 0) / 100)),
      nextActivity: "",
      status: p.estado
    }))
  }, [programs])

  useEffect(() => {
    const computeStats = () => {
      const assignedBeneficiaries = new Set<string>()
      for (const p of programs) {
        if (Array.isArray(p.inscritos)) {
          for (const u of p.inscritos as any[]) {
            if (u && typeof u._id === "string") assignedBeneficiaries.add(u._id)
          }
        }
      }

      const programasActivos = programs.filter(p => p.estado === "activo").length
      const tramitesPendientes = 0
      const visitasProgramadas = 0

      const raw: DashboardStatItem[] = [
        {
          title: "Beneficiarios Asignados",
          value: assignedBeneficiaries.size,
          change: undefined,
          icon: Users,
          color: "emerald",
          description: "En mis programas",
          ariaLabel: "Total de beneficiarios asignados"
        },
        {
          title: "Trámites Pendientes",
          value: tramitesPendientes,
          change: undefined,
          icon: FileText,
          color: "amber",
          description: "Requieren revisión",
          ariaLabel: "Total de trámites pendientes"
        },
        {
          title: "Programas Activos",
          value: programasActivos,
          change: undefined,
          icon: TrendingUp,
          color: "blue",
          description: "Bajo mi supervisión",
          ariaLabel: "Total de programas activos bajo supervisión"
        },
        {
          title: "Visitas Programadas",
          value: visitasProgramadas,
          change: undefined,
          icon: Calendar,
          color: "purple",
          description: "Esta semana",
          ariaLabel: "Total de visitas programadas esta semana"
        }
      ].map(validateStatItem)

      setStatsItems(raw)
    }

    if (programsLoaded) {
      computeStats()
    }
  }, [programsLoaded, programs])

  const handleViewDetails = async (programId: string) => {
    try {
      setProgramDialogOpen(true)
      setProgramDetailsLoading(true)
      setProgramDetailsError(null)
      setProgramDetails(null)
      const details = await fetchProgramById(programId)
      setProgramDetails(details)
    } catch (err: any) {
      setProgramDetailsError(err?.message || 'Error al cargar detalles')
    } finally {
      setProgramDetailsLoading(false)
    }
  }

  const handleViewBeneficiaries = (programId: string, programName: string) => {
    setSelectedProgramId(programId || "all")
    setSelectedProgramName(programName || "Programa")
    setActiveTab("beneficiaries")
  }

  const handleDownloadReport = async (programId: string, programName: string) => {
    try {
      setExportError(null)
      setExportingId(programId)
      const blob = await beneficiariesService.exportBeneficiaries(programId, 'csv')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `beneficiarios-${programName || programId}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setExportError(err?.message || 'Error al generar reporte')
    } finally {
      setExportingId(null)
    }
  }
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
                <p className="text-sm text-gray-600">{`${user?.nombre || 'Usuario'}${user?.dependencia ? ' - ' + user.dependencia : ''}`}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Funcionario Activo
                </Badge>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setActiveTab('calendar'); openNewEvent(); }}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Nueva Actividad
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-live="polite">
            {statsItems.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900" aria-label={stat.ariaLabel}>{stat.value}</p>
                        <div className="flex items-center mt-1">
                          {stat.change && (
                            <p className={`text-sm ${String(stat.change).startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                              {stat.change} esta semana
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </div>
                      <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`} aria-hidden="true">
                        <IconComponent className={`w-6 h-6 text-${stat.color}-600`} aria-hidden="true" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Contenido principal con tabs */}
          <Tabs value={activeTab ?? "procedures"} defaultValue="procedures" className="space-y-6" onValueChange={(v) => setActiveTab(v)}>
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
                        <Input placeholder="Buscar trámites..." className="pl-10 w-64" aria-label="Buscar trámites" value={procedureSearch} onChange={(e) => setProcedureSearch(e.target.value)} />
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {proceduresError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{proceduresError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4">
                    {proceduresLoading && filteredProcedures.length === 0 && (
                      <div className="text-sm text-gray-600">Cargando trámites...</div>
                    )}
                    {filteredProcedures.map((procedure) => (
                      <div
                        key={procedure._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{procedure.titulo}</h3>
                              <Badge className={getPriorityColor(procedure.prioridad)}>
                                {procedure.priority === "high"
                                  ? "Urgente"
                                  : procedure.priority === "medium"
                                    ? "Medio"
                                    : "Bajo"}
                              </Badge>
                              <span className="text-sm text-gray-500">{new Date(procedure.fecha_solicitud).toLocaleDateString('es-CO')}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{procedure.tipo_tramite}</p>
                            <p className="text-sm text-gray-600 mb-2">{procedure.descripcion}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {procedure.vereda}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {/* Placeholder de contacto */}
                                N/D
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
                    {!proceduresLoading && filteredProcedures.length === 0 && !proceduresError && (
                      <div className="text-sm text-gray-600">No hay trámites pendientes.</div>
                    )}
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
                  {programsError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{programsError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-6">
                    {programsLoading && supervisedPrograms.length === 0 && (
                      <div className="text-sm text-gray-600">Cargando programas...</div>
                    )}
                    {supervisedPrograms.map((program) => (
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
                                {program.nextActivity || "Sin actividad próxima"}
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
                            <p className="text-sm text-gray-900">{program.nextActivity || "Sin actividad próxima"}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleViewDetails(program.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalles
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewBeneficiaries(program.id, program.name)}>
                            <Users className="w-4 h-4 mr-2" />
                            Beneficiarios
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadReport(program.id, program.name)} disabled={exportingId === program.id}>
                            <Download className="w-4 h-4 mr-2" />
                            {exportingId === program.id ? 'Descargando...' : 'Reporte'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!programsLoading && supervisedPrograms.length === 0 && !programsError && (
                      <div className="text-sm text-gray-600">No hay programas bajo tu supervisión.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Detalles del Programa</DialogTitle>
                    <DialogDescription>Información del programa seleccionado</DialogDescription>
                  </DialogHeader>
                  {programDetailsLoading && (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-64" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  )}
                  {!programDetailsLoading && programDetailsError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{programDetailsError}</AlertDescription>
                    </Alert>
                  )}
                  {!programDetailsLoading && programDetails && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Nombre</p>
                        <p className="text-sm text-gray-900">{programDetails.nombre}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Estado</p>
                        <p className="text-sm text-gray-900">{programDetails.estado}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-700">Descripción</p>
                        <p className="text-sm text-gray-900">{programDetails.descripcion}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Categoría</p>
                        <p className="text-sm text-gray-900">{programDetails.categoria}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Cupos</p>
                        <p className="text-sm text-gray-900">{programDetails.cupos}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Progreso</p>
                        <p className="text-sm text-gray-900">{programDetails.progreso}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                        <p className="text-sm text-gray-900">{formatCurrency(Number(programDetails.presupuesto || 0))}</p>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Tab de Beneficiarios */}
            <TabsContent value="beneficiaries">
              <BeneficiariesManagement 
                programId={selectedProgramId} 
                programName={selectedProgramName}
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2" role="tablist" aria-label="Vistas del calendario">
                      <Button size="sm" variant={calendarView==='month'?'default':'outline'} onClick={() => setCalendarView('month')}>Mensual</Button>
                      <Button size="sm" variant={calendarView==='week'?'default':'outline'} onClick={() => setCalendarView('week')}>Semanal</Button>
                      <Button size="sm" variant={calendarView==='day'?'default':'outline'} onClick={() => setCalendarView('day')}>Diaria</Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={prevPeriod}>Anterior</Button>
                      <span className="text-sm text-gray-700" aria-live="polite">{formatMonthLabel(calendarDate)}</span>
                      <Button size="sm" variant="outline" onClick={nextPeriod}>Siguiente</Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => openNewEvent()}>Nuevo Evento</Button>
                    </div>
                  </div>
                  {calendarView==='month' && (
                    <div className="grid grid-cols-7 gap-2" role="grid" aria-label="Calendario mensual">
                      {monthGrid(calendarDate).map((day, i) => (
                        <div key={i} className="border border-gray-200 rounded p-2 min-h-[100px]" role="gridcell" aria-label={`Día ${day.toLocaleDateString('es-CO')}`} onDoubleClick={() => openNewEvent(day)}>
                          <p className="text-xs text-gray-500">{day.getDate()}</p>
                          <div className="space-y-1">
                            {eventsForDay(day).map((ev: any) => (
                              <button key={ev._id} className="w-full text-left text-xs bg-purple-50 border border-purple-200 rounded px-1 py-0.5 hover:bg-purple-100" onClick={() => openEditEvent(ev)} aria-label={`Evento ${ev.title}`}>
                                {ev.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{eventEditingId ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
                    <DialogDescription>Completa la información del evento</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-700">Título</label>
                      <input className="mt-1 w-full border rounded p-2" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} aria-label="Título del evento" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Descripción</label>
                      <input className="mt-1 w-full border rounded p-2" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} aria-label="Descripción del evento" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Inicio</label>
                      <input type="datetime-local" className="mt-1 w-full border rounded p-2" value={eventForm.start.slice(0,16)} onChange={(e) => setEventForm({ ...eventForm, start: new Date(e.target.value).toISOString() })} aria-label="Inicio" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Fin</label>
                      <input type="datetime-local" className="mt-1 w-full border rounded p-2" value={eventForm.end.slice(0,16)} onChange={(e) => setEventForm({ ...eventForm, end: new Date(e.target.value).toISOString() })} aria-label="Fin" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 mt-3">
                    {eventEditingId && (
                      <Button size="sm" variant="outline" onClick={deleteEvent}>Eliminar</Button>
                    )}
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={saveEvent}>Guardar</Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" aria-live="polite">
                    <div>
                      <label className="text-sm text-gray-700">Tipo de reporte</label>
                      <select className="mt-1 w-full border rounded p-2" aria-label="Tipo de reporte" value={reportType} onChange={(e) => setReportType(e.target.value as 'overview')}>
                        <option value="overview">General</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Desde</label>
                      <input type="date" className="mt-1 w-full border rounded p-2" aria-label="Desde" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Hasta</label>
                      <input type="date" className="mt-1 w-full border rounded p-2" aria-label="Hasta" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-sm text-gray-700">Búsqueda</label>
                      <input type="text" className="mt-1 w-full border rounded p-2" placeholder="Palabras clave" aria-label="Búsqueda" value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} />
                    </div>
                  </div>
                  {reportError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{reportError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center space-x-2 mb-4">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={previewReport}>Vista previa</Button>
                    <Button size="sm" variant="outline" onClick={() => exportReport('csv')}>Exportar CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => exportReport('xls')}>Exportar Excel</Button>
                    <Button size="sm" variant="outline" onClick={() => exportReport('pdf')}>Exportar PDF</Button>
                  </div>
                  <div className="border rounded p-4">
                    {!reportPreview ? (
                      <p className="text-sm text-gray-600">Vista previa del reporte</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-xs text-emerald-700">Beneficiarios asignados</p>
                          <p className="text-xl font-semibold text-emerald-900">{reportPreview.beneficiariesAssigned}</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-700">Programas activos</p>
                          <p className="text-xl font-semibold text-blue-900">{reportPreview.activePrograms}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                          <p className="text-xs text-amber-700">Trámites pendientes</p>
                          <p className="text-xl font-semibold text-amber-900">{reportPreview.pendingProcedures}</p>
                        </div>
                      </div>
                    )}
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
                {activities.map((a) => {
                  const IconComponent = activityIconFor(a.type)
                  return (
                    <div key={a._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <IconComponent className="w-5 h-5 text-emerald-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{a.message}</p>
                        <p className="text-xs text-gray-500">{new Date(a.time).toLocaleString('es-CO')}</p>
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
  
