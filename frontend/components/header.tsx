'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Bell, Settings, LogOut } from "lucide-react"
import { useAuthContext } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { fetchPrograms } from "@/services/programs.service"

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

            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                  {displayInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{displayInfo.name}</p>
                <p className="text-xs text-gray-600">{displayInfo.subtitle}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
