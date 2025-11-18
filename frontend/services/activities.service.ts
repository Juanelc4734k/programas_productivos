import api from '@/lib/api'

export interface ActivityItem {
  _id: string
  type: string
  message: string
  time: string
}

export const activitiesService = {
  list: async (limit = 10): Promise<ActivityItem[]> => {
    const { data } = await api.get('/activities', { params: { limit } })
    return Array.isArray(data) ? data : []
  }
}