'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bell, Settings, LogOut } from "lucide-react"
import { useAuthContext } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { fetchPrograms } from "@/services/programs.service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Header() {
  const [programs, setPrograms] = useState([])
  const { user, logout } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchPrograms()
        setPrograms(data)
      } catch (error) {
        console.error('Error fetching programs:', error)
      }
    }

    fetchData()
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const getUserDisplayInfo = () => {
    console.log('Usuario en header:', user) // Debug log
    if (!user) return { name: 'Cargando...', subtitle: 'Cargando...' }
    
    switch (user.tipo_usuario) {
      case 'campesino':
        console.log('Datos campesino:', { nombre: user.nombre, vereda: user.vereda }) // Debug log
        return {
          name: user.nombre || 'Campesino',
          subtitle: user.vereda || 'Vereda'
        }
      case 'funcionario':
        return {
          name: user.nombre || 'Funcionario',
          subtitle: user.dependencia || 'Funcionario Municipal'
        }
      case 'admin':
        return {
          name: user.nombre || 'Administrador',
          subtitle: 'Administrador del Sistema'
        }
      default:
        return {
          name: user.nombre || 'Usuario',
          subtitle: 'Sistema'
        }
    }
  }

  const displayInfo = getUserDisplayInfo()

  // Notificaciones: estado y lógica
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  type Notification = {
    id: string
    title: string
    message: string
    date: string
    read: boolean
    type?: 'info' | 'warning' | 'success'
  }
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Nuevo programa', message: 'Se ha publicado un nuevo programa de apoyo.', date: new Date().toISOString(), read: false, type: 'info' },
    { id: '2', title: 'Recordatorio', message: 'Tu inscripción vence pronto.', date: new Date().toISOString(), read: false, type: 'warning' },
    { id: '3', title: 'Actualización', message: 'Se han actualizado los requisitos.', date: new Date().toISOString(), read: true, type: 'success' },
    { id: '4', title: 'Capacitación', message: 'Nueva capacitación disponible.', date: new Date().toISOString(), read: false, type: 'info' },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'important') return n.type === 'warning'
    return true
  })

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
          {/* Logo y título */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">M</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">Alcaldía de Montebello</h1>
                <p className="text-xs sm:text-sm text-gray-600">Programas Productivos Rurales</p>
              </div>
            </div>
          </div>

          {/* Información del usuario y acciones */}
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">

            <Button
              variant="ghost"
              size="sm"
              aria-label="Abrir notificaciones"
              onClick={() => setIsNotificationsOpen(true)}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-emerald-600 text-white">{unreadCount}</Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Abrir configuraciones"
              onClick={() => router.push('/user/configuraciones')}
            >
              <Settings className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center" aria-label="Inicial del usuario">
                <span className="text-xs font-medium text-gray-600">
                  {displayInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{displayInfo.name}</p>
                <p className="text-xs text-gray-600">{displayInfo.subtitle}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de notificaciones */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
            <DialogDescription>Administra tus notificaciones: filtra y marca como leídas.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filtro:</span>
              <Select value={filter} onValueChange={(val) => setFilter(val as 'all' | 'unread' | 'important')}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Selecciona filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="unread">No leídas</SelectItem>
                  <SelectItem value="important">Importantes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={markAllAsRead} aria-label="Marcar todas como leídas">
              Marcar todas como leídas
            </Button>
          </div>

          <ScrollArea className="max-h-72 mt-3">
            <ul role="list" className="space-y-3">
              {filteredNotifications.map(n => (
                <li key={n.id} role="listitem" className="border border-gray-200 rounded-md p-3 flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      {!n.read && <Badge variant="outline" className="text-emerald-700 border-emerald-200">Nuevo</Badge>}
                      {n.type === 'warning' && <Badge variant="outline" className="text-amber-700 border-amber-200">Importante</Badge>}
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1" aria-label={`Fecha: ${new Date(n.date).toLocaleString()}`}>
                      {new Date(n.date).toLocaleString()}
                    </p>
                  </div>
                  <div className="ml-3">
                    {!n.read ? (
                      <Button size="sm" variant="outline" onClick={() => markAsRead(n.id)} aria-label="Marcar como leída">
                        Marcar como leída
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500">Leída</span>
                    )}
                  </div>
                </li>
              ))}
              {filteredNotifications.length === 0 && (
                <li role="listitem" className="text-sm text-gray-600">No hay notificaciones para este filtro.</li>
              )}
            </ul>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationsOpen(false)} aria-label="Cerrar">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
