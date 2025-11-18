import api from '@/lib/api'

export interface UserItem {
  _id: string
  nombre: string
  documento_identidad: string
  correo: string
  telefono: string
  tipo_usuario: 'campesino'|'funcionario'|'admin'
  estado: 'activo'|'inactivo'
  vereda?: string
  dependencia?: string
  fecha_registro?: string
}

export const usersService = {
  list: async (): Promise<UserItem[]> => {
    const { data } = await api.get('/users')
    return Array.isArray(data) ? data : []
  },
  getById: async (id: string): Promise<UserItem> => {
    const { data } = await api.get(`/users/${id}`)
    return data
  },
  toggleStatus: async (id: string): Promise<UserItem> => {
    const { data } = await api.put(`/users/${id}`)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
  registerCampesino: async (payload: { nombre: string; documento_identidad: string; correo: string; telefono: string; contrasena: string; vereda: string; direccion?: string }): Promise<UserItem> => {
    const { data } = await api.post('/auth/register/campesino', payload)
    return data
  },
  registerFuncionario: async (payload: { nombre: string; documento_identidad: string; correo: string; telefono: string; contrasena: string; dependencia: string }): Promise<UserItem> => {
    const { data } = await api.post('/auth/register/funcionario', payload)
    return data
  }
}