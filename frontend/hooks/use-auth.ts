import { useState, useEffect } from 'react'
import { authService } from '@/services/auth.service'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const user = await authService.getCurrentUser()
          setUser(user)
        } catch (err) {
          // Si falla obtener el usuario, limpiar token inválido
          localStorage.removeItem('token')
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
          console.error('Token inválido, limpiando...', err)
        }
      }
    } catch (err) {
      setError(err as null)
    } finally {
      setLoading(false)
    }
  }

  const registerCampesino = async (credentials: {
    nombre: string;
    documento_identidad: string;
    correo: string;
    telefono: string;
    contrasena: string;
    vereda: string;
    direccion?: string;
  }) => {
    try {
      return await authService.registerCampesino(credentials)
    } catch (err) {
      setError(err as null)
      throw err
    }
  }

  const registerFuncionario = async (credentials: {
    nombre: string;
    documento_identidad: string;
    correo: string;
    telefono: string;
    contrasena: string;
    codigo_empleado: string;
    dependencia: string;
  }) => {
    try {
      return await authService.registerFuncionario(credentials)
    } catch (err) {
      setError(err as null)
      throw err
    }
  }

  const loginCampesino = async (credentials: { correo?: string; documento_identidad?: string; contrasena: string }) => {
    try {
      const userData = await authService.loginCampesino(credentials)
      setUser(userData)
      return userData
    } catch (err) {
      setError(err as null)
      throw err
    }
  }

  const loginFuncionario = async (credentials: { correo?: string; documento_identidad?: string; contrasena: string }) => {
    try {
      const userData = await authService.loginFuncionario(credentials)
      setUser(userData)
      return userData
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase()
      const shouldTryAdmin = msg.includes('no es un funcionario')
      if (!shouldTryAdmin) {
        setError(err as null)
        throw err
      }
      try {
        const userData = await authService.loginAdmin(credentials)
        setUser(userData)
        return userData
      } catch (err2) {
        setError(err2 as null)
        throw err2
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    // Eliminar cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    setUser(null)
  }

  return { user, loading, error, registerCampesino, registerFuncionario, loginCampesino, loginFuncionario, logout }
}
