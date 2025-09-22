"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  User,
  MapPin,
  Heart,
  MessageCircle,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  Newspaper,
  Leaf,
  GraduationCap,
  Megaphone,
  TrendingUp
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import api from "@/lib/api"

interface NewsItem {
  _id: string
  titulo: string
  descripcion: string
  fecha: string
  categoria: string
  destacada: boolean
  temas: string[]
  hashtags: string[]
  lugar: string
  autor: {
    _id: string
    nombre: string
    email: string
  }
  vistas: number
  imagen?: string
  estado: string
  metadatos?: {
    resumen?: string
    tiempoLectura?: number
  }
  contenido?: string
  favoritos?: string[]
}

interface RelatedNews {
  _id: string
  titulo: string
  descripcion: string
  fecha: string
  categoria: string
  imagen?: string
  vistas: number
}

export default function NoticiaDetallePage() {
  const params = useParams()
  const [noticia, setNoticia] = useState<NewsItem | null>(null)
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  const fetchNoticia = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/news/${params.id}`)
      
      if (response.data.success) {
        setNoticia(response.data.data)
        setIsFavorite(response.data.data.favoritos?.includes('current-user-id') || false)
        
        // Incrementar vistas
        await api.post(`/news/${params.id}/view`).catch(() => {})
        
        // Obtener noticias relacionadas
        fetchRelatedNews(response.data.data.categoria, response.data.data.temas)
      } else {
        throw new Error(response.data.message || 'Error al cargar la noticia')
      }
    } catch (error) {
      console.error('Error fetching noticia:', error)
      setError('Error al cargar la noticia')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedNews = async (categoria: string, temas: string[]) => {
    try {
      const params = new URLSearchParams({
        categoria,
        limit: '4',
        estado: 'publicada'
      })
      
      if (temas.length > 0) {
        params.append('temas', temas[0])
      }
      
      const response = await api.get(`/news?${params}`)
      
      if (response.data.success) {
        setRelatedNews(response.data.data.filter((n: RelatedNews) => n._id !== noticia?._id) || [])
      }
    } catch (error) {
      console.error('Error fetching related news:', error)
    }
  }

  const toggleFavorite = async () => {
    try {
      await api.post(`/news/${params.id}/favorite`)
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const shareNews = async () => {
    if (navigator.share && noticia) {
      try {
        await navigator.share({
          title: noticia.titulo,
          text: noticia.descripcion,
          url: window.location.href
        })
      } catch (error) {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "programas":
        return <Leaf className="w-4 h-4" />
      case "capacitaciones":
        return <GraduationCap className="w-4 h-4" />
      case "eventos":
        return <Calendar className="w-4 h-4" />
      case "convocatorias":
        return <Megaphone className="w-4 h-4" />
      case "logros":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Newspaper className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "programas":
        return "bg-emerald-100 text-emerald-800"
      case "capacitaciones":
        return "bg-purple-100 text-purple-800"
      case "eventos":
        return "bg-blue-100 text-blue-800"
      case "convocatorias":
        return "bg-amber-100 text-amber-800"
      case "logros":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchNoticia()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando noticia...</p>
        </div>
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la noticia</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/user/noticias">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Noticias
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/user/noticias">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Noticias
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleFavorite}>
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorite ? 'Guardado' : 'Guardar'}
              </Button>
              <Button variant="outline" size="sm" onClick={shareNews}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Artículo Principal */}
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Imagen destacada */}
          {noticia.imagen && (
            <div className="aspect-video bg-gray-100">
              <img
                src={noticia.imagen}
                alt={noticia.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Metadatos */}
            <div className="flex items-center space-x-4 mb-6">
              <Badge className={getCategoryColor(noticia.categoria)}>
                {getCategoryIcon(noticia.categoria)}
                <span className="ml-1 capitalize">{noticia.categoria}</span>
              </Badge>
              {noticia.destacada && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Destacada
                </Badge>
              )}
              {noticia.temas.map((tema, index) => (
                <Badge key={index} variant="outline">
                  {tema}
                </Badge>
              ))}
            </div>

            {/* Título */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{noticia.titulo}</h1>

            {/* Información del artículo */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {noticia.autor.nombre}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(noticia.fecha).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {noticia.metadatos?.tiempoLectura || 3} min de lectura
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                {noticia.vistas} visualizaciones
              </div>
              {noticia.lugar && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {noticia.lugar}
                </div>
              )}
            </div>

            <Separator className="mb-6" />

            {/* Resumen */}
            {noticia.metadatos?.resumen && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Resumen</h3>
                <p className="text-blue-800">{noticia.metadatos.resumen}</p>
              </div>
            )}

            {/* Descripción/Contenido */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {noticia.descripcion}
              </p>
              
              {noticia.contenido && (
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {noticia.contenido}
                </div>
              )}
            </div>

            {/* Hashtags */}
            {noticia.hashtags.length > 0 && (
              <div className="mt-8">
                <Separator className="mb-4" />
                <div className="flex flex-wrap gap-2">
                  {noticia.hashtags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-blue-600 border-blue-200">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={toggleFavorite}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Guardado' : 'Guardar'}
                </Button>
                <Button variant="outline" size="sm" onClick={shareNews}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comentar
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                Publicado el {new Date(noticia.fecha).toLocaleDateString()}
              </div>
            </div>
          </div>
        </article>

        {/* Noticias Relacionadas */}
        {relatedNews.length > 0 && (
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Newspaper className="w-5 h-5 mr-2" />
                Noticias Relacionadas
              </CardTitle>
              <CardDescription>
                Otras noticias que podrían interesarte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedNews.map((related) => (
                  <Link key={related._id} href={`/user/noticias/${related._id}`}>
                    <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      {related.imagen && (
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={related.imagen}
                            alt={related.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <Badge className={`${getCategoryColor(related.categoria)} text-xs px-2 py-1 whitespace-nowrap`}>
                          {related.categoria}
                        </Badge>
                        <h3 className="font-medium text-gray-900 mt-2 mb-2 line-clamp-2">
                          {related.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {related.descripcion}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(related.fecha).toLocaleDateString()}</span>
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {related.vistas}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}