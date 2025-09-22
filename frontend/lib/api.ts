import axios from 'axios'
import { API_BASE_URL } from './config'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Imprimir el error completo para depuración
    console.error('Error completo:', error)
    console.error('Error response:', error.response)
    console.error('Error response data:', error.response?.data)
    
    if (error.response?.status === 401) {
      // Manejar token expirado
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    
    // Asegurar que el mensaje de error se propague correctamente
    if (error.response?.data?.message) {
      error.message = error.response.data.message
      console.log('Mensaje de error asignado:', error.message)
    } else if (error.response?.data) {
      // Si no hay message pero hay data, usar el data como mensaje
      error.message = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)
      console.log('Mensaje de error alternativo asignado:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api