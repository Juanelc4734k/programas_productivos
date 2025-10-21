"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  FileText,
  Download,
  Share2,
  Phone,
  Mail,
  Coffee,
  Leaf,
  Award,
  Target,
  ImageIcon,
  Video,
  Heart,
  Star,
  User,
  MessageSquare,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { fetchProgramById } from "@/services/programs.service"
import { getUserById } from "@/services/user.service"
import type { Program, User as ProgramUser } from "@/types/programs"


// Datos por defecto para mostrar mientras carga
const defaultProgramData = {
  id: 1,
  name: "Programa Café Sostenible",
  description:
    "Programa integral para el mejoramiento de la productividad y sostenibilidad de los cultivos de café en el municipio de Montebello, enfocado en técnicas orgánicas y acceso a mercados especializados.",
  fullDescription:
    "Este programa busca transformar la caficultura local mediante la implementación de prácticas sostenibles que no solo mejoren la productividad, sino que también protejan el medio ambiente y generen mejores ingresos para las familias campesinas. A través de capacitación técnica especializada, entrega de insumos orgánicos certificados, y la creación de canales directos de comercialización, los beneficiarios podrán acceder a mercados premium que valoran la calidad y sostenibilidad del café.",
  category: "Café",
  status: "Activo",
  startDate: "2024-01-15",
  endDate: "2024-12-15",
  progress: 75,
  budget: 450000000,
  beneficiaries: 156,
  families: 89,
  area: "450 hectáreas",
  locations: ["Vereda El Progreso", "Vereda La Esperanza", "Vereda San José"],
  responsable: {
    name: "Ing. Carlos Mendoza",
    position: "Coordinador Técnico",
    phone: "+57 300 123 4567",
    email: "carlos.mendoza@montebello.gov.co",
  },
  institution: "Secretaría de Agricultura - Alcaldía de Montebello",

  objectives: [
    "Mejorar la productividad de los cultivos de café en un 40%",
    "Implementar prácticas sostenibles en 450 hectáreas",
    "Certificar 89 fincas con sello orgánico",
    "Establecer 3 canales de comercialización directa",
    "Capacitar 156 productores en técnicas sostenibles",
  ],

  components: [
    {
      name: "Capacitación Técnica",
      description: "Talleres especializados en manejo sostenible del café",
      progress: 85,
      activities: [
        "Manejo integrado de plagas",
        "Fertilización orgánica",
        "Técnicas de cosecha",
        "Beneficio del café",
        "Certificación orgánica",
      ],
    },
    {
      name: "Entrega de Insumos",
      description: "Suministro de semillas, fertilizantes orgánicos y herramientas",
      progress: 70,
      activities: [
        "Semillas certificadas de alta calidad",
        "Fertilizantes orgánicos",
        "Herramientas especializadas",
        "Equipos de protección",
        "Material de siembra",
      ],
    },
    {
      name: "Asistencia Técnica",
      description: "Acompañamiento personalizado en finca",
      progress: 65,
      activities: [
        "Visitas técnicas mensuales",
        "Diagnóstico de cultivos",
        "Plan de manejo personalizado",
        "Seguimiento de resultados",
        "Resolución de problemas",
      ],
    },
    {
      name: "Comercialización",
      description: "Acceso a mercados especializados y mejores precios",
      progress: 80,
      activities: [
        "Identificación de compradores",
        "Negociación de precios",
        "Logística de transporte",
        "Certificación de calidad",
        "Contratos de venta",
      ],
    },
  ],

  requirements: [
    "Ser productor de café del municipio de Montebello",
    "Tener mínimo 1 hectárea cultivada en café",
    "Compromiso de participar en todas las capacitaciones",
    "Implementar las prácticas recomendadas",
    "Permitir visitas técnicas de seguimiento",
  ],

  benefits: [
    "Capacitación técnica especializada gratuita",
    "Insumos orgánicos subsidiados al 70%",
    "Asistencia técnica personalizada",
    "Acceso a mercados premium",
    "Certificación orgánica gratuita",
    "Mejores precios de venta",
  ],

  timeline: [
    {
      phase: "Fase 1: Inscripción y Diagnóstico",
      period: "Enero - Febrero 2024",
      status: "completado",
      activities: [
        "Convocatoria y inscripciones",
        "Diagnóstico inicial de fincas",
        "Selección de beneficiarios",
        "Formación de grupos de trabajo",
      ],
    },
    {
      phase: "Fase 2: Capacitación y Entrega de Insumos",
      period: "Marzo - Junio 2024",
      status: "completado",
      activities: [
        "Talleres de capacitación técnica",
        "Entrega de semillas e insumos",
        "Inicio de implementación",
        "Primera evaluación",
      ],
    },
    {
      phase: "Fase 3: Implementación y Seguimiento",
      period: "Julio - Octubre 2024",
      status: "en_progreso",
      activities: [
        "Asistencia técnica continua",
        "Monitoreo de cultivos",
        "Ajustes en manejo",
        "Preparación para cosecha",
      ],
    },
    {
      phase: "Fase 4: Cosecha y Comercialización",
      period: "Noviembre - Diciembre 2024",
      status: "programado",
      activities: [
        "Cosecha con técnicas mejoradas",
        "Beneficio del café",
        "Comercialización directa",
        "Evaluación final del programa",
      ],
    },
  ],

  results: [
    {
      indicator: "Productividad promedio",
      baseline: "12 arrobas/hectárea",
      current: "16.8 arrobas/hectárea",
      target: "18 arrobas/hectárea",
      progress: 80,
    },
    {
      indicator: "Fincas certificadas",
      baseline: "0 fincas",
      current: "67 fincas",
      target: "89 fincas",
      progress: 75,
    },
    {
      indicator: "Precio de venta",
      baseline: "$850,000/arroba",
      current: "$1,200,000/arroba",
      target: "$1,300,000/arroba",
      progress: 70,
    },
    {
      indicator: "Área implementada",
      baseline: "0 hectáreas",
      current: "337 hectáreas",
      target: "450 hectáreas",
      progress: 75,
    },
  ],

  testimonials: [
    {
      name: "María González",
      location: "Vereda El Progreso",
      text: "Gracias al programa he mejorado mucho la calidad de mi café. Ahora vendo directamente a compradores especializados y obtengo mejores precios.",
      rating: 5,
    },
    {
      name: "José Ramírez",
      location: "Vereda La Esperanza",
      text: "La capacitación ha sido excelente. He aprendido técnicas que no conocía y mi producción ha aumentado considerablemente.",
      rating: 5,
    },
    {
      name: "Ana Herrera",
      location: "Vereda San José",
      text: "El acompañamiento técnico es muy bueno. Los ingenieros vienen regularmente y nos ayudan a resolver cualquier problema.",
      rating: 4,
    },
  ],

  gallery: [
    { type: "image", url: "/placeholder.svg?height=300&width=400", caption: "Capacitación en manejo de cultivos" },
    { type: "image", url: "/placeholder.svg?height=300&width=400", caption: "Entrega de insumos orgánicos" },
    { type: "image", url: "/placeholder.svg?height=300&width=400", caption: "Visita técnica en finca" },
    { type: "image", url: "/placeholder.svg?height=300&width=400", caption: "Cosecha con técnicas mejoradas" },
    { type: "video", url: "/placeholder.svg?height=300&width=400", caption: "Testimonios de beneficiarios" },
    { type: "image", url: "/placeholder.svg?height=300&width=400", caption: "Certificación orgánica" },
  ],

  documents: [
    { name: "Manual Técnico del Programa", type: "PDF", size: "2.5 MB", url: "#" },
    { name: "Guía de Buenas Prácticas", type: "PDF", size: "1.8 MB", url: "#" },
    { name: "Formulario de Inscripción", type: "PDF", size: "0.5 MB", url: "#" },
    { name: "Cronograma de Actividades", type: "Excel", size: "0.3 MB", url: "#" },
    { name: "Lista de Beneficiarios", type: "Excel", size: "0.2 MB", url: "#" },
  ],
}

export default function ProgramaDetallePage() {
  const params = useParams()
  const programId = params.id as string
  
  const [activeTab, setActiveTab] = useState("general")
  const [programData, setProgramData] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [responsableUser, setResponsableUser] = useState<ProgramUser | null>(null)

  const normalizeId = (val: any): string | null => {
    if (!val) return null
    if (typeof val === "string") return val
    if (typeof val === "object") {
      if (typeof val._id === "string") return val._id
      if (typeof val.$oid === "string") return val.$oid
      const s = typeof val.toString === "function" ? val.toString() : ""
      if (s && s !== "[object Object]") return s
    }
    return null
  }
  
  useEffect(() => {
    const loadProgram = async () => {
      if (!programId) return
      
      try {
        setLoading(true)
        setError(null)
        const program = await fetchProgramById(programId)
        console.log('Program data:', program)
        setProgramData(program)
      } catch (err: any) {
        setError(err.message || 'Error al cargar el programa')
        console.error('Error loading program:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadProgram()
  }, [programId])

  useEffect(() => {
    if (!programData) {
      setResponsableUser(null)
      return
    }

    const ref: any = programData.responsable
    const responsableId = normalizeId(ref)

    let cancelled = false
    const run = async () => {
      try {
        if (responsableId) {
          // Caso ideal: responsable asignado en el programa
          const adapted = await getUserById(responsableId)
          if (!cancelled) setResponsableUser(adapted)
          return
        }

        // Fallback: si responsable es null, intenta con el primer inscrito
        const firstInscrito = Array.isArray(programData.inscritos) ? programData.inscritos[0] : null
        const inscritoId = firstInscrito ? normalizeId(firstInscrito._id) : null

        if (inscritoId) {
          const adapted = await getUserById(inscritoId)
          if (!cancelled) setResponsableUser(adapted)
        } else {
          if (!cancelled) setResponsableUser(null)
        }
      } catch (e) {
        console.error("Error al obtener responsable:", e)
        if (!cancelled) setResponsableUser(null)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [programData]);

  const handleShare = async () => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      const title = programData?.nombre ?? "Programa Productivo"
      const text = programData?.descripcion ?? "Un programa productivo interesante"

      if (navigator.share) {
        await navigator.share({
          url,
          title,
          text,
        })
      } else {
        await navigator.clipboard.writeText(`${title}\n${text}\n${url}`)
        alert("Enlace copiado al portapapeles")
      }
    } catch (error) {
      console.error("Error al compartir:", error)
      try {
        const url = typeof window !== "undefined" ? window.location.href : ""
        await navigator.clipboard.writeText(url)
        alert("No se pudo compartir. Enlace copiado al portapapeles.")
      } catch (error) {
        console.error("Error al obtener URL:", error)
        alert("No se pudo copiar el enlace. Por favor, copielo manualmente.")
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completado":
        return "bg-emerald-100 text-emerald-800"
      case "en_progreso":
        return "bg-blue-100 text-blue-800"
      case "programado":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completado":
        return <CheckCircle className="w-4 h-4" />
      case "en_progreso":
        return <Clock className="w-4 h-4" />
      case "programado":
        return <Calendar className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando programa...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el programa</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  // No program data
  if (!programData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Programa no encontrado</h2>
          <p className="text-gray-600 mb-4">El programa que buscas no existe o ha sido eliminado.</p>
          <Link href="/user/programs">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Volver a Programas
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/user/programs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver a Programas
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{programData.nombre}</h1>
                <p className="text-sm text-gray-600">Secretaría de Agricultura - Alcaldía de Montebello</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-emerald-100 text-emerald-800">{programData.estado}</Badge>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{programData.nombre}</CardTitle>
                    <CardDescription className="text-base">{programData.descripcion}</CardDescription>
                  </div>
                  <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progreso del programa</span>
                    <span className="text-sm font-medium text-gray-900">{programData.progreso}%</span>
                  </div>
                  <Progress value={programData.progreso} className="h-2" />
                </div>

               <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{programData.cupos}</p>
                    <p className="text-sm text-gray-600">Cupos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{programData.ubicaciones?.length || 0}</p>
                    <p className="text-sm text-gray-600">Ubicaciones</p>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Información de contacto */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Responsable del Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{programData.responsable?.nombre || 'No asignado'}</p>
                      <p className="text-sm text-gray-600">{programData.responsable?.tipo_usuario || 'Coordinador'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{programData.responsable?.telefono || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{programData.responsable?.correo || 'No disponible'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Mail className="w-4 h-4 mr-2" />
                      Escribir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicaciones */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Ubicaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {programData.ubicaciones && programData.ubicaciones.length > 0 ? (
                    programData.ubicaciones.map((location, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-gray-700">{location}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">No hay ubicaciones especificadas</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                  <MapPin className="w-4 h-4 mr-2" />
                  Ver en Mapa
                </Button>
              </CardContent>
            </Card>

            {/* Fechas importantes */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Cronograma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Inicio:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(programData.fecha_inicio).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Finalización:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(programData.fecha_fin).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duración:</span>
                      <span className="text-sm font-medium text-gray-900">12 meses</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs de contenido detallado */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="componentes">Componentes</TabsTrigger>
            <TabsTrigger value="cronograma">Cronograma</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="testimonios">Testimonios</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
          </TabsList>

          {/* Tab General */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Objetivos del Programa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {programData?.beneficios && programData.beneficios.length > 0 ? (
                      programData.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{beneficio}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No hay objetivos disponibles</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Requisitos de Participación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {programData?.requisitos && programData.requisitos.length > 0 ? (
                      programData.requisitos.map((requisito, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{requisito}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No hay requisitos disponibles</li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Beneficios del Programa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programData?.beneficios && programData.beneficios.length > 0 ? (
                      programData.beneficios.map((beneficio, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{beneficio}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No hay beneficios disponibles</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Componentes */}
          <TabsContent value="componentes">
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Progreso del Programa</CardTitle>
                    <Badge variant="outline">{programData?.progreso || 0}% completado</Badge>
                  </div>
                  <CardDescription>Estado actual del programa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Progress value={programData?.progreso || 0} className="h-2" />
                  </div>
                  <div className="text-center text-gray-500 py-4">
                    Información detallada de componentes no disponible
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Cronograma */}
          <TabsContent value="cronograma">
            <div className="space-y-6">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      programData?.estado === "activo" ? "bg-emerald-100" : "bg-yellow-100"
                    }`}>
                      {getStatusIcon(programData?.estado || "programado")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Cronograma del Programa</h3>
                        <Badge className={getStatusColor(programData?.estado || "programado")}>
                          {programData?.estado === "activo" ? "Activo" : 
                           programData?.estado === "completado" ? "Completado" : "Programado"}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {programData?.fecha_inicio && programData?.fecha_fin ? 
                          `${new Date(programData.fecha_inicio).toLocaleDateString()} - ${new Date(programData.fecha_fin).toLocaleDateString()}` :
                          "Fechas no disponibles"
                        }
                      </p>
                      <div className="text-center text-gray-500 py-4">
                        Cronograma detallado no disponible
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Resultados */}
          <TabsContent value="resultados">
           <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Progreso General</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Progreso</span>
                      <span className="text-sm font-medium text-gray-900">{programData?.progreso || 0}%</span>
                    </div>
                    <Progress value={programData?.progreso || 0} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Inscritos</p>
                        <p className="font-medium text-emerald-600">{programData?.inscritos?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cupos</p>
                        <p className="font-medium text-blue-600">{programData?.cupos || 0}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Progreso</span>
                      <span className="text-sm font-medium text-gray-900">{programData?.progreso || 0}%</span>
                    </div>
                    <Progress value={programData?.progreso || 0} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Inscritos</p>
                        <p className="font-medium text-emerald-600">{programData?.inscritos?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cupos</p>
                        <p className="font-medium text-blue-600">{programData?.cupos || 0}</p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">Presupuesto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        ${programData?.presupuesto?.toLocaleString() || 'No disponible'}
                      </p>
                      <p className="text-sm text-gray-600">Presupuesto total</p>
                    </div>
                  </div>
                </CardContent>

              </Card>
              </div>

          </TabsContent>

          {/* Tab Testimonios */}
          <TabsContent value="testimonios">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {programData?.testimonios && programData.testimonios.length > 0 ? (
                programData.testimonios.map((testimonio, index) => (
                  <Card key={index} className="bg-white border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{testimonio.nombre}</h4>
                            <div className="flex items-center">
                              {[...Array(testimonio.calificacion || 5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{testimonio.ubicacion || 'Ubicación no disponible'}</p>
                          <p className="text-gray-700 italic">"{testimonio.comentario}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500 py-8">
                  No hay testimonios disponibles
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab Recursos */}
          <TabsContent value="recursos">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información del Programa */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Información del Programa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Categoría</p>
                      <p className="font-medium text-gray-900">{programData?.categoria || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <p className="font-medium text-gray-900">{programData?.estado || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de inicio</p>
                      <p className="font-medium text-gray-900">
                        {programData?.fecha_inicio ? new Date(programData.fecha_inicio).toLocaleDateString() : 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de fin</p>
                      <p className="font-medium text-gray-900">
                        {programData?.fecha_fin ? new Date(programData.fecha_fin).toLocaleDateString() : 'No especificada'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banner del Programa */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Banner del Programa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {programData?.banner_url ? (
                      <img
                        src={programData.banner_url}
                        alt={programData.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-12 h-12" />
                        <span className="ml-2">No hay banner disponible</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Acciones */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-emerald-900 mb-2">¿Interesado en participar?</h3>
                <p className="text-emerald-800">
                  Contacta al responsable del programa para obtener más información sobre cómo participar
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-transparent"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Más Información
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  Inscribirse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
