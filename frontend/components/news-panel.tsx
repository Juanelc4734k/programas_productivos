"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ExternalLink, Bell, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import api from "@/lib/api"

interface NewsItem {
  _id: string
  titulo: string
  descripcion: string
  fecha: string
  categoria: string
  destacada: boolean
  lugar?: string
}

interface EventItem {
  _id: string
  titulo: string
  descripcion: string
  fechaEvento: string
  categoria: string
  lugar: string
  horarioEvento: {
    inicio: string
    fin?: string
  }
}

type CombinedItem = {
  id: string
  title: string
  date: string
  category: string
  excerpt: string
  type: 'news' | 'event'
  priority: 'high' | 'medium'
  location?: string
  time?: string
}

export function NewsPanel() {
  const [items, setItems] = useState<CombinedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para obtener noticias destacadas
  const fetchFeaturedNews = async (): Promise<NewsItem[]> => {
    try {
      const response = await api.get('/news', {
        params: {
          destacada: 'true',
          limit: 3,
          estado: 'publicada'
        }
      })
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching featured news:', error)
      return []
    }
  }

  // Función para obtener eventos próximos
  const fetchUpcomingEvents = async (): Promise<EventItem[]> => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get('/news/events', {
        params: {
          fechaDesde: today,
          limit: 3,
          sortBy: 'fechaEvento',
          sortOrder: 'asc',
          estado: 'programado'
        }
      })
      return response.data.data || []
    } catch (error) {
      console.error('Error fetching upcoming events:', error)
      return []
    }
  }

  // Función para combinar y formatear datos
  const combineAndFormatData = (news: NewsItem[], events: EventItem[]): CombinedItem[] => {
    const formattedNews: CombinedItem[] = news.map(item => ({
      id: item._id,
      title: item.titulo,
      date: item.fecha,
      category: item.categoria,
      excerpt: item.descripcion && item.descripcion.length > 100 
        ? item.descripcion.substring(0, 100) + '...' 
        : item.descripcion || 'Sin descripción',
      type: 'news' as const,
      priority: item.destacada ? 'high' as const : 'medium' as const,
      location: item.lugar
    }))

    const formattedEvents: CombinedItem[] = events.map(item => ({
      id: item._id,
      title: item.titulo,
      date: item.fechaEvento,
      category: item.categoria,
      excerpt: item.descripcion && item.descripcion.length > 100 
        ? item.descripcion.substring(0, 100) + '...' 
        : item.descripcion || 'Sin descripción',
      type: 'event' as const,
      priority: 'medium' as const,
      location: item.lugar,
      time: item.horarioEvento?.inicio ? 
        item.horarioEvento.inicio + (item.horarioEvento.fin ? ` - ${item.horarioEvento.fin}` : '') 
        : 'Horario por definir'
    }))

    // Combinar y ordenar: noticias destacadas primero, luego por fecha
    const combined = [...formattedNews, ...formattedEvents]
    
    return combined.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (b.priority === 'high' && a.priority !== 'high') return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }).slice(0, 5)
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [newsData, eventsData] = await Promise.all([
          fetchFeaturedNews(),
          fetchUpcomingEvents()
        ])
        
        const combinedData = combineAndFormatData(newsData, eventsData)
        setItems(combinedData)
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Error al cargar las noticias y eventos')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Noticias y Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-sm text-gray-600">Cargando...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay noticias o eventos disponibles</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div key={item.id} className={`border-l-4 pl-3 sm:pl-4 ${
                item.type === 'event' ? 'border-blue-500' : 'border-emerald-500'
              }`}>
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          item.priority === "high"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : item.type === 'event'
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {item.category}
                      </Badge>
                      {item.type === 'event' && (
                        <Badge variant="secondary" className="text-xs">
                          Evento
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-start sm:items-end text-xs text-gray-500 gap-1">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      {item.time && (
                        <div className="flex items-center">
                          <span className="text-xs">🕒 {item.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 sm:line-clamp-3">
                  {item.excerpt}
                </p>
                {item.location && (
                  <div className="text-xs text-gray-500 mb-2">
                    <span>📍 {item.location}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-auto p-0 text-xs sm:text-sm ${
                    item.type === 'event' 
                      ? 'text-blue-600 hover:text-blue-700'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {item.type === 'event' ? 'Ver evento' : 'Leer más'}
                </Button>
              </div>
            ))}
          </div>
        )}

        <Link href="/user/noticias">
          <Button variant="outline" size="sm" className="w-full mt-3 sm:mt-4 text-xs sm:text-sm">
            Ver todas las noticias
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
