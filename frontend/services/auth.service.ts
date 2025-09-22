import api from '@/lib/api'
import { API_ENDPOINTS } from '@/lib/config'

interface CampesinoRegisterCredentials {
  nombre: string;
  documento_identidad: string;
  correo: string;
  telefono: string;
  contrasena: string;
  vereda: string;
  direccion?: string;
}

interface FuncionarioRegisterCredentials {
  nombre: string;
  documento_identidad: string;
  correo: string;
  telefono: string;
  contrasena: string;
  codigo_empleado: string;
  dependencia: string;
}

interface LoginCredentials {
  correo?: string;
  documento_identidad?: string;
  contrasena: string;
}

export const authService = {
  async registerCampesino(credentials: CampesinoRegisterCredentials) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.registerCampesino, credentials)
      return response.data
    } catch (error: any) {
      throw error
    }
  },

  async registerFuncionario(credentials: FuncionarioRegisterCredentials) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.registerFuncionario, credentials)
      return response.data
    } catch (error: any) {
      throw error
    }
  },
  
  async loginCampesino(credentials: { correo?: string; documento_identidad?: string; contrasena: string }) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.loginCampesino, credentials)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      // Almacenar también en cookies para el middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 días
      return user
    } catch (error: any) {
      throw error
    }
  },

  async loginFuncionario(credentials: { correo?: string; documento_identidad?: string; contrasena: string }) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.loginFuncionario, credentials)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      // Almacenar también en cookies para el middleware
      document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 días
      return user
    } catch (error: any) {
      throw error
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get(API_ENDPOINTS.auth.me || '/auth/me')
      // Extraer el usuario de la respuesta
      return response.data.user || response.data
    } catch (error: any) {
      throw error
    }
  }

}