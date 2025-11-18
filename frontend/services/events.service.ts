import api from '@/lib/api'

export interface CalendarEvent {
  _id?: string
  title: string
  description?: string
  start: string
  end: string
  vereda?: string
}

export const eventsService = {
  list: async (params: { from?: string; to?: string } = {}): Promise<CalendarEvent[]> => {
    const { data } = await api.get('/events', { params })
    return Array.isArray(data) ? data : []
  },
  create: async (event: CalendarEvent): Promise<CalendarEvent> => {
    const { data } = await api.post('/events', event)
    return data
  },
  update: async (id: string, event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data } = await api.put(`/events/${id}`, event)
    return data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`)
  }
}