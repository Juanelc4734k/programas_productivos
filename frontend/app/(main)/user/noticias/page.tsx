"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Newspaper,
  Calendar,
  User,
  Search,
  ArrowLeft,
  Eye,
  Share2,
  Bookmark,
  Clock,
  MapPin,
  Users,
  Megaphone,
  Leaf,
  GraduationCap,
  TrendingUp,
  Bell,
  ExternalLink,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

// Interfaces para los datos del backend
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
}

interface EventItem {
  _id: string
  titulo: string
  descripcion: string
  categoria: string
  fechaEvento: string
  horarioEvento: {
    inicio: string
    fin?: string
  }
  lugar: string
  organizador: {
    _id: string
    nombre: string
    email: string
  }
  participantes?: {
    maximo?: number
    registrados: any[]
  }
  imagen?: string
  estado: string
}

// Los datos estáticos han sido eliminados - ahora se cargan desde el backend

const categorias = [
  { value: "todas", label: "Todas las categorías", icon: Newspaper },
  { value: "programas", label: "Programas Productivos", icon: Leaf },
  { value: "capacitaciones", label: "Capacitaciones", icon: GraduationCap },
  { value: "eventos", label: "Eventos", icon: Calendar },
  { value: "convocatorias", label: "Convocatorias", icon: Megaphone },
  { value: "logros", label: "Logros y Resultados", icon: TrendingUp },
]

export default function NoticiasPage() {
  // Estados para filtros y UI
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todas")
  const [selectedSubcategory, setSelectedSubcategory] = useState("todas")
  const [activeTab, setActiveTab] = useState("noticias")
  
  // Estados para datos del backend
  const [noticias, setNoticias] = useState<NewsItem[]>([])
  const [eventos, setEventos] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Función para obtener noticias del backend
  const fetchNoticias = async (page = 1, filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        estado: 'publicada',
        ...filters
      })
      
      console.log('Fetching noticias with params:', params.toString())
      
      const response = await api.get(`/news?${params}`)
      
      if (response.data.success) {
        setNoticias(response.data.data || [])
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage)
          setTotalPages(response.data.pagination.totalPages)
          setTotalItems(response.data.pagination.totalItems)
        }
        console.log('Noticias loaded:', response.data.data?.length || 0)
      } else {
        throw new Error(response.data.message || 'Error al cargar noticias')
      }
    } catch (error) {
      console.error('Error fetching noticias:', error)
      setError('Error al cargar las noticias')
      // Datos de ejemplo como fallback
      setNoticias([
        {
          _id: '1',
          titulo: 'Nuevo Programa de Café Sostenible',
          descripcion: 'La Alcaldía lanza programa integral para mejorar la productividad del café local',
          fecha: new Date().toISOString(),
          categoria: 'Programas',
          destacada: true,
          temas: ['Cafe'],
          hashtags: ['café', 'sostenibilidad'],
          lugar: 'Montebello',
          autor: { _id: '1', nombre: 'Secretaría de Agricultura', email: '' },
          vistas: 1250,
          estado: 'publicada',
          metadatos: { tiempoLectura: 3 }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener eventos del backend
  const fetchEventos = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get(`/news/events?fechaDesde=${today}&limit=10`)
      
      if (response.data.success) {
        setEventos(response.data.data || [])
        console.log('Eventos loaded:', response.data.data?.length || 0)
      } else {
        throw new Error(response.data.message || 'Error al cargar eventos')
      }
    } catch (error) {
      console.error('Error fetching eventos:', error)
      // Datos de ejemplo como fallback
      setEventos([
        {
          _id: '1',
          titulo: 'Taller: Manejo Integrado de Plagas en Café',
          descripcion: 'Capacitación técnica para productores de café',
          categoria: 'Capacitaciones',
          fechaEvento: '2025-01-15',
          horarioEvento: { inicio: '08:00', fin: '17:00' },
          lugar: 'Salón Comunal El Progreso',
          organizador: { _id: '1', nombre: 'Secretaría de Agricultura', email: '' },
          estado: 'programado'
        }
      ])
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchNoticias()
    fetchEventos()
  }, [])

  // Recargar noticias cuando cambien los filtros
  useEffect(() => {
    const filters: any = {}
    
    if (selectedCategory !== 'todas') {
      filters.categoria = selectedCategory
    }
    
    if (selectedSubcategory !== 'todas') {
      filters.temas = selectedSubcategory
    }
    
    if (searchTerm.trim()) {
      filters.busqueda = searchTerm.trim()
    }
    
    fetchNoticias(1, filters)
    setCurrentPage(1) // Reset page when filters change
  }, [selectedCategory, selectedSubcategory, searchTerm])

  // Función para manejar cambio de página
  const handlePageChange = (page: number) => {
    const filters: any = {}
    
    if (selectedCategory !== 'todas') {
      filters.categoria = selectedCategory
    }
    
    if (selectedSubcategory !== 'todas') {
      filters.temas = selectedSubcategory
    }
    
    if (searchTerm.trim()) {
      filters.busqueda = searchTerm.trim()
    }
    
    fetchNoticias(page, filters)
  }

  const getCategoryIcon = (category: string) => {
    const cat = categorias.find((c) => c.value === category)
    return cat ? <cat.icon className="w-4 h-4" /> : <Newspaper className="w-4 h-4" />
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

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "capacitacion":
        return "bg-purple-100 text-purple-800"
      case "evento":
        return "bg-blue-100 text-blue-800"
      case "entrega":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Los filtros ahora se manejan en el backend
  const filteredNoticias = noticias
  const noticiasFeatured = noticias.filter((n) => n.destacada)
  const noticiasRecientes = noticias.slice(0, 6)

  const subcategorias = ["todas", ...Array.from(new Set(noticias.map((n) => n.temas).flat()))]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/user">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Noticias y Eventos</h1>
                <p className="text-sm text-gray-600">Mantente informado sobre programas productivos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Newspaper className="w-3 h-3 mr-1" />
                {noticias.length} Noticias
              </Badge>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Newspaper className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                  <p className="text-sm text-gray-600">Noticias Publicadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{eventos.length}</p>
                  <p className="text-sm text-gray-600">Eventos Programados</p>
                </div>
              </div>
            </CardContent>
          </Card>


          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{noticiasFeatured.length}</p>
                  <p className="text-sm text-gray-600">Noticias Destacadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="noticias">Noticias</TabsTrigger>
            <TabsTrigger value="eventos">Eventos Próximos</TabsTrigger>
          </TabsList>

          {/* Tab de Noticias */}
          <TabsContent value="noticias">
            {/* Filtros */}
            <Card className="bg-white border border-gray-200 mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar noticias..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          <div className="flex items-center">
                            <categoria.icon className="w-4 h-4 mr-2" />
                            {categoria.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todos los temas</SelectItem>
                      {subcategorias.slice(1).map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Noticias Destacadas */}
            {loading ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Noticias Destacadas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="flex justify-center items-center py-12 col-span-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando noticias destacadas...</span>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Noticias Destacadas</h2>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar noticias destacadas</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={() => fetchNoticias()} variant="outline">
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : noticiasFeatured.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Noticias Destacadas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {noticiasFeatured.map((noticia) => (
                    <Card
                      key={noticia._id}
                      className="bg-white border border-gray-200 hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        <img
                          src={noticia.imagen || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=news%20article%20placeholder%20colombia%20government&image_size=landscape_16_9"}
                          alt={noticia.titulo}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className={getCategoryColor(noticia.categoria)}>
                            {getCategoryIcon(noticia.categoria)}
                            <span className="ml-1 capitalize">{noticia.categoria}</span>
                          </Badge>
                        </div>
                        {noticia.destacada && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="bg-white/90 text-gray-900">
                              Destacada
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(noticia.fecha).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {noticia.metadatos?.tiempoLectura || 3} min lectura
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{noticia.titulo}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{noticia.descripcion}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{noticia.autor.nombre}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                              <Eye className="w-4 h-4 mr-2" />
                              Leer más
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Todas las Noticias */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas las Noticias</h2>
              <div className="space-y-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando noticias...</span>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar noticias</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => fetchNoticias()} variant="outline">
                      Reintentar
                    </Button>
                  </div>
                ) : filteredNoticias.length === 0 ? (
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="p-12 text-center">
                      <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron noticias</h3>
                      <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredNoticias.map((noticia) => (
                    <Card key={noticia._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-6">
                          <div className="w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={noticia.imagen || "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=news%20article%20placeholder%20colombia%20government&image_size=landscape_16_9"}
                              alt={noticia.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge className={getCategoryColor(noticia.categoria)}>
                                {getCategoryIcon(noticia.categoria)}
                                <span className="ml-1 capitalize">{noticia.categoria}</span>
                              </Badge>
                              {noticia.temas.length > 0 && (
                                <Badge variant="outline">{noticia.temas[0]}</Badge>
                              )}
                              {noticia.destacada && (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Destacada
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{noticia.titulo}</h3>
                            <p className="text-gray-600 mb-3 line-clamp-2">{noticia.descripcion}</p>

                            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {noticia.autor.nombre}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(noticia.fecha).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {noticia.metadatos?.tiempoLectura || 3} min
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {noticia.lugar}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {noticia.hashtags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  <Bookmark className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Leer más
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="text-sm text-gray-600">
                  Mostrando página {currentPage} de {totalPages} ({totalItems} noticias en total)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1 || loading}
                   >
                     <ChevronLeft className="w-4 h-4 mr-1" />
                     Anterior
                   </Button>
                   
                   <div className="flex items-center space-x-1">
                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                       const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                       return (
                         <Button
                           key={pageNum}
                           variant={pageNum === currentPage ? "default" : "outline"}
                           size="sm"
                           onClick={() => handlePageChange(pageNum)}
                           disabled={loading}
                           className={pageNum === currentPage ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                         >
                           {pageNum}
                         </Button>
                       )
                     })}
                   </div>
                   
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages || loading}
                   >
                     Siguiente
                     <ChevronRight className="w-4 h-4 ml-1" />
                   </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab de Eventos */}
          <TabsContent value="eventos">
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Próximos Eventos
                  </CardTitle>
                  <CardDescription>Eventos y actividades programadas para los próximos días</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Cargando eventos...</span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar eventos</h3>
                      <p className="text-gray-600 mb-4">{error}</p>
                      <Button onClick={() => fetchEventos()} variant="outline">
                        Reintentar
                      </Button>
                    </div>
                  ) : eventos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos programados</h3>
                      <p className="text-gray-600">No se encontraron eventos próximos.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventos.map((evento) => (
                      <Card key={evento._id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-medium text-gray-900">{evento.titulo}</h3>
                                <Badge className={getEventTypeColor(evento.categoria)}>
                                  {evento.categoria === "Capacitaciones"
                                    ? "Capacitación"
                                    : evento.categoria === "Eventos"
                                      ? "Evento"
                                      : "Entrega"}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 mb-3">{evento.descripcion}</p>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(evento.fechaEvento).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {evento.horarioEvento.inicio}{evento.horarioEvento.fin ? ` - ${evento.horarioEvento.fin}` : ''}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {evento.lugar}
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {evento.participantes?.registrados?.length || 0} participantes
                                </div>
                              </div>

                              <p className="text-sm text-gray-600">Organiza: {evento.organizador.nombre}</p>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Bell className="w-4 h-4 mr-2" />
                                Recordar
                              </Button>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Información adicional */}
        <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Mantente Informado</h3>
                <div className="text-blue-800 space-y-2">
                  <p>• Suscríbete para recibir las últimas noticias por correo electrónico</p>
                  <p>• Guarda tus noticias favoritas para leer más tarde</p>
                  <p>• Comparte información importante con otros productores</p>
                  <p>• Recibe notificaciones de eventos y convocatorias</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    <Bell className="w-4 h-4 mr-2" />
                    Suscribirse
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Newsletter
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
