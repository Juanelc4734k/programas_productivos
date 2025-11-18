import api from '@/lib/api'

export interface HealthComponent {
  component: string
  status: 'healthy' | 'warning' | 'error'
  uptime: string
  lastCheck: string
}

export const adminHealthService = {
  fetch: async (): Promise<HealthComponent[]> => {
    const { data } = await api.get('/admin/system/health')
    const list = Array.isArray(data?.data) ? data.data : []
    return list as HealthComponent[]
  }
}