"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { tramitesService } from "@/services/tramite.service"
import { useAuth } from "@/hooks/use-auth"
import {
  FileText, Upload, Search, Clock, CheckCircle, XCircle,
  AlertCircle, ArrowLeft, Package, Wrench, Users, Award,
  Eye, Download, MessageSquare,
} from "lucide-react"
import Link from "next/link"

const tramiteTypes = [
  {
    id: "supplies_request",
    name: "Solicitud de Insumos",
    description: "Solicita semillas, fertilizantes, herramientas y otros insumos agrícolas",
    icon: Package,
    color: "emerald",
    fields: ["Tipo de insumo", "Cantidad requerida", "Justificación", "Fecha necesaria"],
  },
  {
    id: "technical_request", // Fixed: changed from technical_assistance
    name: "Asistencia Técnica",
    description: "Solicita asesoría técnica especializada para tu cultivo o proyecto",
    icon: Wrench,
    color: "blue",
    fields: ["Tipo de asistencia", "Problema específico", "Cultivo afectado", "Urgencia"],
  },
  {
    id: "program_enrollment",
    name: "Inscripción a Programas",
    description: "Inscríbete a los programas productivos disponibles",
    icon: Users,
    color: "purple",
    fields: ["Programa de interés", "Experiencia previa", "Disponibilidad", "Expectativas"],
  },
  {
    id: "certificate_request",
    name: "Solicitud de Certificados",
    description: "Solicita certificados de participación, finalización o reconocimientos",
    icon: Award,
    color: "amber",
    fields: ["Tipo de certificado", "Programa relacionado", "Fecha de participación", "Uso del certificado"],
  },
]

const programs = [
  "Café Sostenible",
  "Agricultura Familiar",
  "Ganadería Sostenible",
  "Cultivos Alternativos",
  "Huertos Urbanos",
]

const insumoTypes = [
  { value: "semillas-de-cafe", label: "Semillas de café" },
  { value: "semillas-de-hortalizas", label: "Semillas de hortalizas" },
  { value: "fertilizantes-organicos", label: "Fertilizantes orgánicos" },
  { value: "fertilizantes-quimicos", label: "Fertilizantes químicos" },
  { value: "herramientas-de-trabajo", label: "Herramientas de trabajo" },
  { value: "sistemas-de-riego", label: "Sistemas de riego" },
  { value: "plantas-frutales", label: "Plantas frutales" },
  { value: "otros", label: "Otros insumos" },
]

const assistanceTypes = [
  "Control de plagas",
  "Manejo de enfermedades",
  "Técnicas de siembra",
  "Sistemas de riego",
  "Poda y mantenimiento",
  "Cosecha y postcosecha",
  "Comercialización",
  "Otros temas técnicos",
]

const certificateTypes = [
  "Certificado de participación",
  "Certificado de finalización",
  "Certificado de competencias",
  "Constancia de beneficiario",
  "Reconocimiento especial",
]

export default function TramitesPage() {
  const [activeTab, setActiveTab] = useState("nuevo")
  const [selectedTramiteType, setSelectedTramiteType] = useState("supplies_request")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [tramites, setTramites] = useState([])
  const [formData, setFormData] = useState({
    titulo: "", // Fixed: changed from title
    tipo_tramite: "supplies_request",
    descripcion: "",
    documento: null,
    tipo_insumo: "",
    cantidad: 0, // Fixed: changed to number
    vereda: "", // Fixed: added missing field
    prioridad: "medium", // Fixed: changed from urgencia
    tipo_asistencia: "",
    cultivo: "",
    programa: "",
    tipo_certificado: ""
  })
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const cargarTramites = async () => {
      try {
        const data = await tramitesService.listarMisTramites()
        setTramites(data)
      } catch (error) {
        console.error("Error al cargar trámites:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los trámites",
          variant: "destructive",
        })
      }
    }
    cargarTramites()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cantidad' ? Number(value) : value // Fixed: convert cantidad to number
    }))
  }

  // Add handler for Select components
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      documento: e.target.files[0]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const datosTramite = {
        ...formData,
        tipo_tramite: selectedTramiteType,
        cantidad: Number(formData.cantidad) // Ensure it's a number
      }

      await tramitesService.crear(datosTramite)
      toast({
        title: "Éxito",
        description: "Trámite creado correctamente",
      })

      // Recargar la lista de trámites
      const nuevosTramites = await tramitesService.listarMisTramites()
      setTramites(nuevosTramites)

      // Limpiar formulario
      setFormData({
        titulo: "", // Fixed: changed from title
        tipo_tramite: "supplies_request",
        descripcion: "",
        documento: null,
        tipo_insumo: "",
        cantidad: 0, // Fixed: changed to number
        vereda: "", // Fixed: added missing field
        prioridad: "medium", // Fixed: changed from urgencia
        tipo_asistencia: "",
        cultivo: "",
        programa: "",
        tipo_certificado: ""
      })
      setActiveTab("consultar")
    } catch (error) {
      console.error("Error al crear trámite:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el trámite",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredTramites = tramites.filter(
    (tramite) =>
      tramite.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite.tipo_tramite?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tramite._id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTipoTramiteText = (tipo: string) => {
  switch (tipo) {
    case "supplies_request":
      return "Solicitud de Insumos"
    case "technical_request": // Fixed: changed from technical_assistance
      return "Asistencia Técnica"
    case "program_enrollment":
      return "Inscripción a Programas"
    case "certificate_request":
      return "Solicitud de Certificados"
    default:
      return tipo
  }
}

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "in_review":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-emerald-100 text-emerald-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4" />
      case "in_review":
        return <AlertCircle className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "submitted":
        return "Enviado"
      case "in_review":
        return "En Revisión"
      case "approved":
        return "Aprobado"
      case "rejected":
        return "Rechazado"
      case "completed":
        return "Completado"
      default:
        return "Desconocido"
    }
  }


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
                <h1 className="text-xl font-semibold text-gray-900">Gestión de Trámites</h1>
                <p className="text-sm text-gray-600">Solicita y consulta el estado de tus trámites</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileText className="w-3 h-3 mr-1" />
                {tramites.length} Trámites
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nuevo">Nuevo Trámite</TabsTrigger>
            <TabsTrigger value="consultar">Mis Trámites</TabsTrigger>
          </TabsList>

          {/* Tab para crear nuevo trámite */}
          <TabsContent value="nuevo" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Crear Nuevo Trámite
                </CardTitle>
                <CardDescription>
                  Selecciona el tipo de trámite que necesitas y completa la información requerida
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Selector de tipo de trámite */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {tramiteTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedTramiteType === type.id ? "ring-2 ring-emerald-500 bg-emerald-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedTramiteType(type.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div
                            className={`w-12 h-12 bg-${type.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}
                          >
                            <IconComponent className={`w-6 h-6 text-${type.color}-600`} />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{type.name}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2">{type.description}</p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Formulario dinámico según el tipo seleccionado */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título del Trámite *</Label>
                      <Input
                        id="titulo"
                        name="titulo" // Fixed: changed from title
                        placeholder="Describe brevemente tu solicitud"
                        value={formData.titulo} // Fixed: changed from title
                        onChange={handleInputChange}
                        required
                        className="border-gray-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vereda">Vereda *</Label>
                      <Input
                        id="vereda"
                        name="vereda"
                        placeholder="Ingresa el nombre de la vereda"
                        value={formData.vereda}
                        onChange={handleInputChange}
                        required
                        className="border-gray-300"
                      />
                    </div>

                    {/* Always show tipo_insumo as it's required in backend */}
                    <div className="space-y-2">
                      <Label htmlFor="tipo_insumo">Tipo de Insumo *</Label>
                      <Select 
                        value={formData.tipo_insumo} 
                        onValueChange={(value) => handleSelectChange('tipo_insumo', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo de insumo" />
                        </SelectTrigger>
                        <SelectContent>
                          {insumoTypes.map((insumo) => (
                            <SelectItem key={insumo.value} value={insumo.value}>
                              {insumo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cantidad">Cantidad Requerida *</Label>
                      <Input 
                        id="cantidad" 
                        name="cantidad"
                        type="text" // Fixed: added number type
                        placeholder="Ej: 500, 10, 2" 
                        value={formData.cantidad}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>

                    {selectedTramiteType === "technical_request" && ( // Fixed: changed from technical_assistance
                      <div className="space-y-2">
                        <Label htmlFor="tipo_asistencia">Tipo de Asistencia</Label>
                        <Select 
                          value={formData.tipo_asistencia}
                          onValueChange={(value) => handleSelectChange('tipo_asistencia', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de asistencia" />
                          </SelectTrigger>
                          <SelectContent>
                            {assistanceTypes.map((assistance) => (
                              <SelectItem key={assistance} value={assistance.toLowerCase().replace(/\s+/g, "-")}>
                                {assistance}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedTramiteType === "program_enrollment" && (
                      <div className="space-y-2">
                        <Label htmlFor="programa">Programa de Interés</Label>
                        <Select 
                          value={formData.programa}
                          onValueChange={(value) => handleSelectChange('programa', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el programa" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program} value={program.toLowerCase().replace(/\s+/g, "-")}>
                                {program}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedTramiteType === "certificate_request" && (
                      <div className="space-y-2">
                        <Label htmlFor="tipo_certificado">Tipo de Certificado</Label>
                        <Select 
                          value={formData.tipo_certificado}
                          onValueChange={(value) => handleSelectChange('tipo_certificado', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de certificado" />
                          </SelectTrigger>
                          <SelectContent>
                            {certificateTypes.map((certificate) => (
                              <SelectItem key={certificate} value={certificate.toLowerCase().replace(/\s+/g, "-")}>
                                {certificate}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="cultivo">Cultivo Afectado</Label>
                      <Input 
                        id="cultivo" 
                        name="cultivo"
                        placeholder="Ej: Café, Plátano, Tomate" 
                        value={formData.cultivo}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridad">Nivel de Prioridad</Label> {/* Fixed: changed from urgencia */}
                      <Select 
                        value={formData.prioridad} // Fixed: changed from urgencia
                        onValueChange={(value) => handleSelectChange('prioridad', value)} // Fixed: changed from urgencia
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baja - Puede esperar</SelectItem>
                          <SelectItem value="medium">Media - En los próximos días</SelectItem>
                          <SelectItem value="high">Alta - Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción Detallada *</Label>
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      placeholder="Describe detalladamente tu solicitud, incluyendo cualquier información relevante"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows={4}
                      required
                      className="border-gray-300"
                    />
                  </div>



                  {/* Subir documentos */}
                  <div className="space-y-2">
                    <Label htmlFor="documents">Documentos de Apoyo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Arrastra archivos aquí o{" "}
                        <button type="button" className="text-emerald-600 hover:underline">
                          selecciona archivos
                        </button>
                      </p>
                      <p className="text-xs text-gray-500">PDF, JPG, PNG hasta 10MB cada uno</p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Una vez enviado tu trámite, recibirás un número de seguimiento y podrás consultar su estado en la
                      pestaña "Mis Trámites". El tiempo de respuesta es de 3-5 días hábiles.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline">
                      Guardar Borrador
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Trámite"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab para consultar trámites */}
          <TabsContent value="consultar" className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      Mis Trámites
                    </CardTitle>
                    <CardDescription>Consulta el estado y detalles de tus solicitudes</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Buscar trámites..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredTramites.map((tramite) => (
                    <Card key={tramite._id} className="border border-gray-200 hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900">{tramite.titulo}</h3>
                              <Badge className={getStatusColor(tramite.estado)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(tramite.estado)}
                                  <span>{getStatusText(tramite.estado)}</span>
                                </div>
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">ID:</span> {tramite._id}
                              </div>
                              <div>
                                <span className="font-medium">Tipo:</span> {getTipoTramiteText(tramite.tipo_tramite)}
                              </div>
                              <div>
                                <span className="font-medium">Fecha:</span>{" "}
                                {new Date(tramite.fecha_solicitud).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{tramite.descripcion}</p>
                            {tramite.revisado_por && (
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Revisor asignado:</span> {tramite.revisado_por}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Button>
                            {tramite.estado === "completed" && (
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Descargar
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Comentar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredTramites.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron trámites</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm ? "Intenta con otros términos de búsqueda" : "Aún no has creado ningún trámite"}
                      </p>
                      <Button
                        onClick={() => setActiveTab("nuevo")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Crear Primer Trámite
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información de ayuda */}
        <Card className="bg-blue-50 border border-blue-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-2">¿Necesitas ayuda con tu trámite?</h3>
                <p className="text-blue-800 mb-4">
                  Si tienes dudas sobre cómo llenar el formulario o necesitas asistencia, nuestro equipo está disponible
                  para ayudarte.
                </p>
                <div className="flex items-center space-x-4">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    📞 Llamar: (123) 456-7890
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent">
                    💬 WhatsApp: 300-123-4567
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


