"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
  LogOut,
} from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { useEffect, useState } from "react"
import { adminStatsService } from "@/services/admin-stats.service"
import { adminHealthService } from "@/services/admin-health.service"
import { fetchPrograms, fetchProgramById, createProgram, updateProgram, deleteProgram } from "@/services/programs.service"
import { useRouter } from "next/navigation"

interface StatItem { title: string; value: string | number; change: string; icon: any; color: string; description: string }

interface HealthComponent { component: string; status: 'healthy'|'warning'|'error'|'unknown'; uptime: string; lastCheck: string }

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
  const router = useRouter()
  const [systemStats, setSystemStats] = useState<StatItem[]>([])
  const [statsError, setStatsError] = useState<string | null>(null)
  const [systemHealth, setSystemHealth] = useState<HealthComponent[]>([])
  const [healthError, setHealthError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [usersError, setUsersError] = useState<string | null>(null)
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false)
  const [newUserType, setNewUserType] = useState<'campesino'|'funcionario'>('campesino')
  const [newUserForm, setNewUserForm] = useState({ nombre: '', documento_identidad: '', correo: '', telefono: '', contrasena: '', vereda: '', dependencia: '' })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterTipo, setFilterTipo] = useState<'all'|'campesino'|'funcionario'|'admin'>('all')
  const [filterEstado, setFilterEstado] = useState<'all'|'activo'|'inactivo'>('all')
  const [userMenuOpenId, setUserMenuOpenId] = useState<string | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [programsError, setProgramsError] = useState<string | null>(null)
  const [programsLoading, setProgramsLoading] = useState(false)
  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [programDetails, setProgramDetails] = useState<any | null>(null)
  const [newProgramDialogOpen, setNewProgramDialogOpen] = useState(false)
  const [newProgramForm, setNewProgramForm] = useState({ nombre: '', descripcion: '', categoria: '', fecha_inicio: '', fecha_fin: '', cupos: 0, presupuesto: 0, beneficios: '', requisitos: '', ubicaciones: '' })
  const [systemPeriod, setSystemPeriod] = useState<number>(30)
  const [systemStatsPreview, setSystemStatsPreview] = useState<any | null>(null)
  const [systemConfigError, setSystemConfigError] = useState<string | null>(null)
  const [reportType, setReportType] = useState<'programs'|'participants'|'statistics'|'executive'>('statistics')
  const [reportFrom, setReportFrom] = useState<string>('')
  const [reportTo, setReportTo] = useState<string>('')
  const [reportPreview, setReportPreview] = useState<any | null>(null)
  const [reportError, setReportError] = useState<string | null>(null)
  const [selectedProgramId, setSelectedProgramId] = useState<string>('')
  useEffect(() => {
    (async () => {
      try {
        setStatsError(null)
        const s = await adminStatsService.fetch()
        const fmtCurrency = (n: number) => {
          try { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n) } catch { return `$${n}` }
        }
        const items: StatItem[] = [
          { title: 'Total Usuarios', value: s.totalUsuarios, change: '', icon: Users, color: 'blue', description: 'Campesinos y funcionarios' },
          { title: 'Programas Activos', value: s.programasActivos, change: '', icon: TrendingUp, color: 'emerald', description: 'En ejecución' },
          { title: 'Presupuesto Total', value: s.presupuestoTotal >= 1_000_000 ? `${(s.presupuestoTotal/1_000_000).toFixed(1)}M` : s.presupuestoTotal >= 1_000 ? `${(s.presupuestoTotal/1_000).toFixed(1)}K` : String(s.presupuestoTotal), change: '', icon: DollarSign, color: 'purple', description: 'Asignado' },
          { title: 'Veredas Activas', value: `${s.veredasActivas}/${s.totalVeredas}`, change: '', icon: MapPin, color: 'amber', description: 'Con programas' }
        ]
        setSystemStats(items)
      } catch (err: any) {
        setStatsError(err?.message || 'Error al cargar estadísticas')
      }
    })()
  }, [])
  useEffect(() => {
    (async () => {
      try {
        setProgramsLoading(true)
        setProgramsError(null)
        const list = await fetchPrograms()
        setPrograms(list)
      } catch (err: any) {
        setProgramsError(err?.message || 'Error al cargar programas')
      } finally {
        setProgramsLoading(false)
      }
    })()
  }, [])
  useEffect(() => {
    (async () => {
      try {
        setUsersLoading(true)
        setUsersError(null)
        const { usersService } = await import('@/services/users.service')
        const list = await usersService.list()
        setUsers(list)
      } catch (err: any) {
        setUsersError(err?.message || 'Error al cargar usuarios')
      } finally {
        setUsersLoading(false)
      }
    })()
  }, [])

  const openProgramDetails = async (id: string) => {
    try {
      setProgramDialogOpen(true)
      setProgramDetails(null)
      const d = await fetchProgramById(id)
      setProgramDetails(d)
    } catch (err: any) {
      setProgramsError(err?.message || 'Error al cargar detalles del programa')
    }
  }
  const exportProgramReport = async (id: string) => {
    try {
      const { data } = await (await import('@/lib/api')).default.get(`/admin/reports/programs/${id}`)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-programa-${id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setProgramsError(err?.message || 'Error al exportar reporte del programa')
    }
  }
  const openNewProgram = () => {
    setNewProgramDialogOpen(true)
    setNewProgramForm({ nombre: '', descripcion: '', categoria: '', fecha_inicio: '', fecha_fin: '', cupos: 0, presupuesto: 0, beneficios: '', requisitos: '', ubicaciones: '' })
  }
  const saveNewProgram = async () => {
    try {
      const payload = {
        nombre: newProgramForm.nombre,
        descripcion: newProgramForm.descripcion,
        categoria: newProgramForm.categoria,
        fecha_inicio: newProgramForm.fecha_inicio,
        fecha_fin: newProgramForm.fecha_fin,
        cupos: Number(newProgramForm.cupos),
        presupuesto: Number(newProgramForm.presupuesto),
        beneficios: newProgramForm.beneficios.split(',').map(s => s.trim()).filter(Boolean),
        requisitos: newProgramForm.requisitos.split(',').map(s => s.trim()).filter(Boolean),
        ubicaciones: newProgramForm.ubicaciones.split(',').map(s => s.trim()).filter(Boolean)
      }
      const created = await createProgram(payload as any)
      setPrograms((prev) => [created, ...prev])
      setNewProgramDialogOpen(false)
    } catch (err: any) {
      setProgramsError(err?.message || 'Error al crear programa')
    }
  }
  const configureProgram = async (id: string) => {
    try {
      setProgramDialogOpen(true)
      const d = await fetchProgramById(id)
      setProgramDetails(d)
    } catch (err: any) {
      setProgramsError(err?.message || 'Error al cargar programa para configurar')
    }
  }
  const saveProgramConfig = async () => {
    try {
      if (!programDetails?._id) return
      const updated = await updateProgram(programDetails._id, { descripcion: programDetails.descripcion, categoria: programDetails.categoria, estado: programDetails.estado, presupuesto: programDetails.presupuesto, cupos: programDetails.cupos })
      setPrograms((prev) => prev.map((p) => (p._id === updated._id ? updated : p)))
      setProgramDialogOpen(false)
    } catch (err: any) {
      setProgramsError(err?.message || 'Error al guardar configuración')
    }
  }
  const removeProgram = async (id: string) => {
    try {
      await deleteProgram(id)
      setPrograms((prev) => prev.filter((p) => p._id !== id))
    } catch (err: any) {
      setProgramsError(err?.message || 'Error al eliminar programa')
    }
  }

  const previewSystemStats = async () => {
    try {
      const api = (await import('@/lib/api')).default
      const { data } = await api.get('/admin/reports/statistics', { params: { period: systemPeriod } })
      setSystemStatsPreview(data?.data || null)
      setSystemConfigError(null)
    } catch (err: any) {
      setSystemConfigError(err?.message || 'Error al obtener estadísticas')
    }
  }
  const exportSystemStatsCSV = async () => {
    try {
      const api = (await import('@/lib/api')).default
      const { data } = await api.get('/admin/reports/export/statistics', { params: { format: 'csv' } })
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'estadisticas_sistema.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setSystemConfigError(null)
    } catch (err: any) {
      setSystemConfigError(err?.message || 'Error al exportar CSV')
    }
  }
  const exportSystemStatsPDF = async () => {
    try {
      const api = (await import('@/lib/api')).default
      const res = await api.get('/admin/reports/export/statistics', { params: { format: 'pdf' }, responseType: 'blob' })
      const url = window.URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'estadisticas_sistema.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setSystemConfigError(null)
    } catch (err: any) {
      setSystemConfigError(err?.message || 'Error al exportar PDF')
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return true
    return (
      (u.nombre || '').toLowerCase().includes(q) ||
      (u.correo || '').toLowerCase().includes(q) ||
      (u.documento_identidad || '').toLowerCase().includes(q) ||
      (u.vereda || '').toLowerCase().includes(q) ||
      (u.dependencia || '').toLowerCase().includes(q)
    )
  }).filter((u) => (filterTipo === 'all' ? true : u.tipo_usuario === filterTipo)).filter((u) => (filterEstado === 'all' ? true : u.estado === filterEstado))

  const getUserTypeLabel = (u: any) => u.tipo_usuario === 'campesino' ? 'Campesino' : u.tipo_usuario === 'funcionario' ? 'Funcionario' : 'Admin'
  const getUserLocation = (u: any) => u.tipo_usuario === 'campesino' ? (u.vereda || 'Sin vereda') : (u.dependencia || 'Sin dependencia')

  const toggleUserStatus = async (id: string) => {
    try {
      const { usersService } = await import('@/services/users.service')
      const updated = await usersService.toggleStatus(id)
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)))
    } catch (err: any) {
      setUsersError(err?.message || 'Error al cambiar estado')
    }
  }

  const openNewUser = () => {
    setNewUserDialogOpen(true)
    setNewUserForm({ nombre: '', documento_identidad: '', correo: '', telefono: '', contrasena: '', vereda: '', dependencia: '' })
    setNewUserType('campesino')
  }
  const saveNewUser = async () => {
    try {
      const { usersService } = await import('@/services/users.service')
      if (newUserType === 'campesino') {
        const created = await usersService.registerCampesino({ nombre: newUserForm.nombre, documento_identidad: newUserForm.documento_identidad, correo: newUserForm.correo, telefono: newUserForm.telefono, contrasena: newUserForm.contrasena, vereda: newUserForm.vereda })
        setUsers((prev) => [created, ...prev])
      } else {
        const created = await usersService.registerFuncionario({ nombre: newUserForm.nombre, documento_identidad: newUserForm.documento_identidad, correo: newUserForm.correo, telefono: newUserForm.telefono, contrasena: newUserForm.contrasena, dependencia: newUserForm.dependencia })
        setUsers((prev) => [created, ...prev])
      }
      setNewUserDialogOpen(false)
    } catch (err: any) {
      setUsersError(err?.message || 'Error al crear usuario')
    }
  }
  useEffect(() => {
    (async () => {
      try {
        setHealthError(null)
        const h = await adminHealthService.fetch()
        setSystemHealth(h)
      } catch (err: any) {
        setHealthError(err?.message || 'Error al cargar estado del sistema')
      }
    })()
  }, [])
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
                <Button variant="outline" size="sm" onClick={() => { localStorage.removeItem('token'); router.push('/auth/login'); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Estadísticas del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsError && (
              <Card className="bg-white border border-red-200">
                <CardContent className="p-4">
                  <p className="text-sm text-red-700">{statsError}</p>
                </CardContent>
              </Card>
            )}
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
                          {stat.change && (
                            <p className={`text-sm ${stat.change.includes("+") || stat.change.includes("%") ? "text-emerald-600" : "text-red-600"}`}>{stat.change} este mes</p>
                          )}
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
                {healthError && (
                  <Card className="bg-white border border-red-200 md:col-span-2 lg:col-span-4">
                    <CardContent className="p-4">
                      <p className="text-sm text-red-700">{healthError}</p>
                    </CardContent>
                  </Card>
                )}
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
                        <Input placeholder="Buscar usuarios..." className="pl-10 w-64" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} aria-label="Buscar usuarios" />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFiltersOpen((v) => !v)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                      </Button>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={openNewUser}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {usersError && (
                      <Card className="bg-white border border-red-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-red-700">{usersError}</p>
                        </CardContent>
                      </Card>
                    )}
                    {usersLoading && filteredUsers.length === 0 && (
                      <div className="text-sm text-gray-600">Cargando usuarios...</div>
                    )}
                    {filteredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{user.nombre}</h3>
                              <p className="text-sm text-gray-600">{user.correo}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getUserTypeLabel(user)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {getUserLocation(user)}
                                </span>
                                <span className="text-xs text-gray-500">Registrado: {new Date(user.fecha_registro).toLocaleDateString('es-CO')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getUserStatusColor(user.estado)}>
                              {user.estado === "activo" ? "Activo" : "Inactivo"}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => toggleUserStatus(user._id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Cambiar estado
                            </Button>
                            <div className="relative">
                              <Button size="sm" variant="ghost" onClick={() => setUserMenuOpenId(user._id === userMenuOpenId ? null : user._id)}>
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                              {userMenuOpenId === user._id && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow">
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => alert(`ID: ${user._id}`)}>Copiar ID</button>
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => toggleUserStatus(user._id)}>Cambiar estado</button>
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={async () => { const { usersService } = await import('@/services/users.service'); await usersService.remove(user._id); setUsers((prev) => prev.filter((u) => u._id !== user._id)); setUserMenuOpenId(null); }}>Eliminar</button>
                                </div>
                              )}
                              {filtersOpen && (
                              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded mb-4">
                                <div>
                                  <label className="text-xs text-gray-700">Tipo</label>
                                  <select className="mt-1 border rounded p-2 text-sm" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as any)} aria-label="Filtro tipo">
                                    <option value="all">Todos</option>
                                    <option value="campesino">Campesinos</option>
                                    <option value="funcionario">Funcionarios</option>
                                    <option value="admin">Admins</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-700">Estado</label>
                                  <select className="mt-1 border rounded p-2 text-sm" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as any)} aria-label="Filtro estado">
                                    <option value="all">Todos</option>
                                    <option value="activo">Activos</option>
                                    <option value="inactivo">Inactivos</option>
                                  </select>
                                </div>
                              </div>
                            )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Usuario</DialogTitle>
                  <DialogDescription>Completa la información del usuario</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-700">Tipo</label>
                    <select className="mt-1 w-full border rounded p-2" value={newUserType} onChange={(e) => setNewUserType(e.target.value as any)} aria-label="Tipo de usuario">
                      <option value="campesino">Campesino</option>
                      <option value="funcionario">Funcionario</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Nombre</label>
                    <input className="mt-1 w-full border rounded p-2" value={newUserForm.nombre} onChange={(e) => setNewUserForm({ ...newUserForm, nombre: e.target.value })} aria-label="Nombre" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Documento</label>
                    <input className="mt-1 w-full border rounded p-2" value={newUserForm.documento_identidad} onChange={(e) => setNewUserForm({ ...newUserForm, documento_identidad: e.target.value })} aria-label="Documento" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Correo</label>
                    <input type="email" className="mt-1 w-full border rounded p-2" value={newUserForm.correo} onChange={(e) => setNewUserForm({ ...newUserForm, correo: e.target.value })} aria-label="Correo" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Teléfono</label>
                    <input className="mt-1 w-full border rounded p-2" value={newUserForm.telefono} onChange={(e) => setNewUserForm({ ...newUserForm, telefono: e.target.value })} aria-label="Teléfono" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Contraseña</label>
                    <input type="password" className="mt-1 w-full border rounded p-2" value={newUserForm.contrasena} onChange={(e) => setNewUserForm({ ...newUserForm, contrasena: e.target.value })} aria-label="Contraseña" />
                  </div>
                  {newUserType === 'campesino' ? (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-700">Vereda</label>
                      <input className="mt-1 w-full border rounded p-2" value={newUserForm.vereda} onChange={(e) => setNewUserForm({ ...newUserForm, vereda: e.target.value })} aria-label="Vereda" />
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-700">Dependencia</label>
                      <input className="mt-1 w-full border rounded p-2" value={newUserForm.dependencia} onChange={(e) => setNewUserForm({ ...newUserForm, dependencia: e.target.value })} aria-label="Dependencia" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => setNewUserDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={saveNewUser}>Crear</Button>
                </div>
              </DialogContent>
            </Dialog>

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
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={openNewProgram}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Programa
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {programsError && (
                      <Card className="bg-white border border-red-200">
                        <CardContent className="p-4">
                          <p className="text-sm text-red-700">{programsError}</p>
                        </CardContent>
                      </Card>
                    )}
                    {programsLoading && programs.length === 0 && (
                      <div className="text-sm text-gray-600">Cargando programas...</div>
                    )}
                    {programs.map((program) => (
                      <div key={program._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{program.nombre}</h3>
                            <p className="text-sm text-gray-600">Categoría: {program.categoria}</p>
                          </div>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {program.estado}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Beneficiarios</p>
                            <p className="text-2xl font-bold text-gray-900">{(program.inscritos || []).length}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Presupuesto</p>
                            <p className="text-lg font-semibold text-gray-900">${(program.presupuesto || 0).toLocaleString('es-CO')}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Veredas</p>
                            <p className="text-2xl font-bold text-gray-900">{(program.ubicaciones || []).length}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Progreso</p>
                            <div className="mt-1">
                              <Progress value={program.progreso || 0} className="h-2" />
                              <p className="text-sm text-gray-600 mt-1">{program.progreso || 0}%</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => openProgramDetails(program._id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Detalles
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportProgramReport(program._id)}>
                            <Download className="w-4 h-4 mr-2" />
                            Reporte
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => configureProgram(program._id)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Configurar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removeProgram(program._id)}>Eliminar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalles del Programa</DialogTitle>
                  <DialogDescription>Información del programa seleccionado</DialogDescription>
                </DialogHeader>
                {!programDetails ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Cargando detalles...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-700">Nombre</label>
                      <input className="mt-1 w-full border rounded p-2" value={programDetails.nombre} onChange={(e) => setProgramDetails({ ...programDetails, nombre: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Categoría</label>
                      <input className="mt-1 w-full border rounded p-2" value={programDetails.categoria} onChange={(e) => setProgramDetails({ ...programDetails, categoria: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-700">Descripción</label>
                      <textarea className="mt-1 w-full border rounded p-2" value={programDetails.descripcion} onChange={(e) => setProgramDetails({ ...programDetails, descripcion: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Estado</label>
                      <select className="mt-1 w-full border rounded p-2" value={programDetails.estado} onChange={(e) => setProgramDetails({ ...programDetails, estado: e.target.value })}>
                        <option value="activo">Activo</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="en espera">En espera</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Cupos</label>
                      <input type="number" className="mt-1 w-full border rounded p-2" value={programDetails.cupos || 0} onChange={(e) => setProgramDetails({ ...programDetails, cupos: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Presupuesto</label>
                      <input type="number" className="mt-1 w-full border rounded p-2" value={programDetails.presupuesto || 0} onChange={(e) => setProgramDetails({ ...programDetails, presupuesto: Number(e.target.value) })} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => setProgramDialogOpen(false)}>Cerrar</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={saveProgramConfig}>Guardar</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={newProgramDialogOpen} onOpenChange={setNewProgramDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nuevo Programa</DialogTitle>
                  <DialogDescription>Completa la información requerida</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-700">Nombre</label>
                    <input className="mt-1 w-full border rounded p-2" value={newProgramForm.nombre} onChange={(e) => setNewProgramForm({ ...newProgramForm, nombre: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Categoría</label>
                    <input className="mt-1 w-full border rounded p-2" value={newProgramForm.categoria} onChange={(e) => setNewProgramForm({ ...newProgramForm, categoria: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Descripción</label>
                    <textarea className="mt-1 w-full border rounded p-2" value={newProgramForm.descripcion} onChange={(e) => setNewProgramForm({ ...newProgramForm, descripcion: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Fecha Inicio</label>
                    <input type="date" className="mt-1 w-full border rounded p-2" value={newProgramForm.fecha_inicio} onChange={(e) => setNewProgramForm({ ...newProgramForm, fecha_inicio: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Fecha Fin</label>
                    <input type="date" className="mt-1 w-full border rounded p-2" value={newProgramForm.fecha_fin} onChange={(e) => setNewProgramForm({ ...newProgramForm, fecha_fin: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Cupos</label>
                    <input type="number" className="mt-1 w-full border rounded p-2" value={newProgramForm.cupos} onChange={(e) => setNewProgramForm({ ...newProgramForm, cupos: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700">Presupuesto</label>
                    <input type="number" className="mt-1 w-full border rounded p-2" value={newProgramForm.presupuesto} onChange={(e) => setNewProgramForm({ ...newProgramForm, presupuesto: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Beneficios (separados por coma)</label>
                    <input className="mt-1 w-full border rounded p-2" value={newProgramForm.beneficios} onChange={(e) => setNewProgramForm({ ...newProgramForm, beneficios: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Requisitos (separados por coma)</label>
                    <input className="mt-1 w-full border rounded p-2" value={newProgramForm.requisitos} onChange={(e) => setNewProgramForm({ ...newProgramForm, requisitos: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Ubicaciones (veredas, separadas por coma)</label>
                    <input className="mt-1 w-full border rounded p-2" value={newProgramForm.ubicaciones} onChange={(e) => setNewProgramForm({ ...newProgramForm, ubicaciones: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <Button variant="outline" size="sm" onClick={() => setNewProgramDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm" onClick={saveNewProgram}>Crear</Button>
                </div>
              </DialogContent>
            </Dialog>

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
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">Período (días)</label>
                      <input type="number" className="mt-1 w-full border rounded p-2" value={systemPeriod} onChange={(e) => setSystemPeriod(Number(e.target.value))} aria-label="Periodo en días" />
                    </div>
                    <div className="md:col-span-2 flex items-end space-x-2">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={previewSystemStats}>Vista previa</Button>
                      <Button size="sm" variant="outline" onClick={exportSystemStatsCSV}>Exportar CSV</Button>
                      <Button size="sm" variant="outline" onClick={exportSystemStatsPDF}>Exportar PDF</Button>
                    </div>
                  </div>
                  {systemConfigError && (
                    <div className="text-sm text-red-700">{systemConfigError}</div>
                  )}
                  <div className="border rounded p-4">
                    {!systemStatsPreview ? (
                      <p className="text-sm text-gray-600">Vista previa de estadísticas del sistema</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-xs text-emerald-700">Total Programas</p>
                          <p className="text-xl font-semibold text-emerald-900">{systemStatsPreview.programas?.total ?? 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-700">Total Usuarios</p>
                          <p className="text-xl font-semibold text-blue-900">{systemStatsPreview.usuarios?.total ?? 0}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                          <p className="text-xs text-amber-700">Proyectos</p>
                          <p className="text-xl font-semibold text-amber-900">{systemStatsPreview.proyectos?.total ?? 0}</p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-xs text-purple-700">Tasa de finalización</p>
                          <p className="text-xl font-semibold text-purple-900">{systemStatsPreview.proyectos?.tasaCompletacion ?? 0}%</p>
                        </div>
                      </div>
                    )}
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
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">Tipo de reporte</label>
                      <select className="mt-1 w-full border rounded p-2" value={reportType} onChange={(e) => setReportType(e.target.value as any)} aria-label="Tipo de reporte ejecutivo">
                        <option value="programs">Programas</option>
                        <option value="participants">Participantes</option>
                        <option value="statistics">Estadísticas</option>
                        <option value="executive">Resumen ejecutivo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Desde</label>
                      <input type="date" className="mt-1 w-full border rounded p-2" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} aria-label="Fecha desde" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Hasta</label>
                      <input type="date" className="mt-1 w-full border rounded p-2" value={reportTo} onChange={(e) => setReportTo(e.target.value)} aria-label="Fecha hasta" />
                    </div>
                    {reportType === 'programs' && (
                      <div className="md:col-span-3">
                        <label className="text-sm text-gray-700">Programa</label>
                        <select className="mt-1 w-full border rounded p-2" value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)} aria-label="Programa">
                          <option value="">Todos</option>
                          {programs.map((p) => (
                            <option key={p._id} value={p._id}>{p.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {reportError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{reportError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={async () => { try { const api = (await import('@/lib/api')).default; let res; if (reportType === 'programs') { const params: any = {}; if (reportFrom) params.startDate = reportFrom; if (reportTo) params.endDate = reportTo; res = await api.get('/admin/reports/programs', { params }); } else if (reportType === 'participants') { const params: any = {}; if (reportFrom) params.startDate = reportFrom; if (reportTo) params.endDate = reportTo; res = await api.get('/admin/reports/participants', { params }); } else if (reportType === 'statistics') { const params: any = { period: systemPeriod }; res = await api.get('/admin/reports/statistics', { params }); } else { const params: any = {}; if (reportFrom) params.startDate = reportFrom; if (reportTo) params.endDate = reportTo; res = await api.get('/admin/reports/executive-summary', { params }); } setReportPreview(res.data?.data || null); setReportError(null); } catch (err: any) { setReportError(err?.message || 'Error al obtener reporte'); } }}>Vista previa</Button>
                    <Button size="sm" variant="outline" onClick={async () => { try { const api = (await import('@/lib/api')).default; const { data } = await api.get(`/admin/reports/export/${reportType}`, { params: { format: 'csv' } }); const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'text/csv' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reporte-${reportType}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url); setReportError(null); } catch (err: any) { setReportError(err?.message || 'Error al exportar CSV'); } }}>Exportar CSV</Button>
                    <Button size="sm" variant="outline" onClick={async () => { try { const api = (await import('@/lib/api')).default; const res = await api.get(`/admin/reports/export/${reportType}`, { params: { format: 'pdf' }, responseType: 'blob' }); const url = window.URL.createObjectURL(res.data); const a = document.createElement('a'); a.href = url; a.download = `reporte-${reportType}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url); setReportError(null); } catch (err: any) { setReportError(err?.message || 'Error al exportar PDF'); } }}>Exportar PDF</Button>
                  </div>
                  <div className="border rounded p-4">
                    {!reportPreview ? (
                      <p className="text-sm text-gray-600">Vista previa del reporte</p>
                    ) : reportType === 'programs' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                            <p className="text-xs text-emerald-700">Total Programas</p>
                            <p className="text-xl font-semibold text-emerald-900">{reportPreview.resumen?.totalPrograms ?? 0}</p>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-blue-700">Activos</p>
                            <p className="text-xl font-semibold text-blue-900">{reportPreview.resumen?.activePrograms ?? 0}</p>
                          </div>
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                            <p className="text-xs text-amber-700">Participantes</p>
                            <p className="text-xl font-semibold text-amber-900">{reportPreview.resumen?.totalParticipants ?? 0}</p>
                          </div>
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                            <p className="text-xs text-purple-700">Presupuesto</p>
                            <p className="text-xl font-semibold text-purple-900">${(reportPreview.resumen?.totalBudget || 0).toLocaleString('es-CO')}</p>
                          </div>
                        </div>
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left">
                                <th className="p-2">Nombre</th>
                                <th className="p-2">Estado</th>
                                <th className="p-2">Participantes</th>
                                <th className="p-2">Presupuesto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(reportPreview.programas || []).map((p: any) => (
                                <tr key={p.id}>
                                  <td className="p-2">{p.nombre}</td>
                                  <td className="p-2">{p.estado}</td>
                                  <td className="p-2">{p.participantes}</td>
                                  <td className="p-2">${(p.presupuesto || 0).toLocaleString('es-CO')}</td>
                                </tr>
                              ))} 
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : reportType === 'participants' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                            <p className="text-xs text-emerald-700">Total Participantes</p>
                            <p className="text-xl font-semibold text-emerald-900">{reportPreview.resumen?.totalParticipantes ?? 0}</p>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-blue-700">Promedio Programas</p>
                            <p className="text-xl font-semibold text-blue-900">{reportPreview.resumen?.programasPromedio ?? 0}</p>
                          </div>
                        </div>
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left">
                                <th className="p-2">Nombre</th>
                                <th className="p-2">Documento</th>
                                <th className="p-2">Programas</th>
                                <th className="p-2">Proyectos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(reportPreview.participantes || []).map((p: any) => (
                                <tr key={p.id}>
                                  <td className="p-2">{p.nombre}</td>
                                  <td className="p-2">{p.documento}</td>
                                  <td className="p-2">{p.programas?.total ?? 0}</td>
                                  <td className="p-2">{p.proyectos?.total ?? 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : reportType === 'statistics' ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-xs text-emerald-700">Programas</p>
                          <p className="text-xl font-semibold text-emerald-900">{reportPreview.programas?.total ?? 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-700">Usuarios</p>
                          <p className="text-xl font-semibold text-blue-900">{reportPreview.usuarios?.total ?? 0}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                          <p className="text-xs text-amber-700">Proyectos</p>
                          <p className="text-xl font-semibold text-amber-900">{reportPreview.proyectos?.total ?? 0}</p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-xs text-purple-700">Completación</p>
                          <p className="text-xl font-semibold text-purple-900">{reportPreview.proyectos?.tasaCompletacion ?? 0}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-xs text-emerald-700">Activos</p>
                          <p className="text-xl font-semibold text-emerald-900">{reportPreview.indicadoresClave?.programasActivos ?? 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-700">Participantes</p>
                          <p className="text-xl font-semibold text-blue-900">{reportPreview.indicadoresClave?.totalParticipantes ?? 0}</p>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                          <p className="text-xs text-amber-700">Proyectos en ejecución</p>
                          <p className="text-xl font-semibold text-amber-900">{reportPreview.indicadoresClave?.proyectosEnEjecucion ?? 0}</p>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                          <p className="text-xs text-purple-700">Presupuesto total</p>
                          <p className="text-xl font-semibold text-purple-900">${(reportPreview.indicadoresClave?.presupuestoTotal || 0).toLocaleString('es-CO')}</p>
                        </div>
                      </div>
                    )}
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
                  
  
                  
