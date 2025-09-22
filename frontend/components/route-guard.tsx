'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  id: string
  tipo_usuario: string
  iat: number
  exp: number
}

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

export function RouteGuard({ 
  children, 
  allowedRoles = ['funcionario', 'admin', 'campesino'], 
  redirectTo = '/' 
}: RouteGuardProps) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.log('No token found, redirecting to login')
          router.push('/auth/login')
          return
        }
        
        const decoded = jwtDecode<DecodedToken>(token)
        
        // Verificar si el token ha expirado
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired, cleaning up')
          localStorage.removeItem('token')
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
          router.push('/auth/login')
          return
        }
        
        console.log('User type:', decoded.tipo_usuario)
        console.log('Allowed roles:', allowedRoles)
        
        // Verificar roles
        if (!allowedRoles.includes(decoded.tipo_usuario)) {
          console.log('User not authorized for this route')
          alert('No tienes permisos para acceder a esta página')
          router.push(redirectTo)
          return
        }
        
        console.log('User authorized, showing content')
        setIsAuthorized(true)
        
      } catch (error) {
        console.error('Error checking auth:', error)
        localStorage.removeItem('token')
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        router.push('/auth/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Verificando permisos...</h2>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}