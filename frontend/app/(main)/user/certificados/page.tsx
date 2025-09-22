"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Award,
  Download,
  Search,
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  Eye,
  Share2,
  Printer,
  Mail,
  Star,
  GraduationCap,
  Trophy,
  Shield,
} from "lucide-react"
import Link from "next/link"

const certificados = [
  {
    id: "CERT-2024-001",
    title: "Manejo Sostenible del Café",
    type: "capacitacion",
    category: "Café",
    issueDate: "2024-12-15",
    expiryDate: "2026-12-15",
    status: "vigente",
    grade: 95,
    duration: 40,
    instructor: "Ing. Carlos Mendoza",
    institution: "Alcaldía de Montebello",
    description: "Certificación en técnicas sostenibles para el cultivo de café orgánico",
    competencies: [
      "Manejo integrado de plagas",
      "Fertilización orgánica",
      "Técnicas de cosecha",
      "Beneficio del café",
      "Certificación orgánica",
    ],
    verificationCode: "MONT-CAFE-2024-001",
    digitalSignature: true,
  },
  {
    id: "CERT-2024-002",
    title: "Agricultura Familiar Sostenible",
    type: "programa",
    category: "Agricultura",
    issueDate: "2024-11-20",
    expiryDate: "2027-11-20",
    status: "vigente",
    grade: 88,
    duration: 120,
    instructor: "Ing. Ana Herrera",
    institution: "Secretaría de Agricultura",
    description: "Certificación por participación exitosa en programa de agricultura familiar",
    competencies: [
      "Diversificación de cultivos",
      "Huertos orgánicos",
      "Comercialización directa",
      "Gestión financiera agrícola",
      "Asociatividad rural",
    ],
    verificationCode: "MONT-AGRI-2024-002",
    digitalSignature: true,
  },
  {
    id: "CERT-2024-003",
    title: "Sistemas Silvopastoriles",
    type: "capacitacion",
    category: "Ganadería",
    issueDate: "2024-10-10",
    expiryDate: "2026-10-10",
    status: "vigente",
    grade: 92,
    duration: 32,
    instructor: "Dr. Miguel Torres",
    institution: "Universidad Nacional",
    description: "Certificación en implementación de sistemas ganaderos sostenibles",
    competencies: [
      "Diseño silvopastoril",
      "Selección de especies arbóreas",
      "Manejo de pasturas",
      "Bienestar animal",
      "Conservación ambiental",
    ],
    verificationCode: "MONT-SILVO-2024-003",
    digitalSignature: true,
  },
  {
    id: "CERT-2024-004",
    title: "Tecnologías Digitales Agrícolas",
    type: "taller",
    category: "Tecnología",
    issueDate: "2024-09-05",
    expiryDate: "2025-09-05",
    status: "vigente",
    grade: 85,
    duration: 16,
    instructor: "Ing. Laura Gómez",
    institution: "Centro de Innovación Rural",
    description: "Certificación en uso de herramientas digitales para agricultura de precisión",
    competencies: [
      "Apps agrícolas móviles",
      "Monitoreo climático",
      "Registro digital de cultivos",
      "Comercio electrónico",
      "Redes sociales agrícolas",
    ],
    verificationCode: "MONT-TECH-2024-004",
    digitalSignature: true,
  },
  {
    id: "CERT-2023-015",
    title: "Liderazgo Rural Comunitario",
    type: "programa",
    category: "Liderazgo",
    issueDate: "2023-12-01",
    expiryDate: "2025-12-01",
    status: "por_vencer",
    grade: 90,
    duration: 80,
    instructor: "Lic. Roberto Silva",
    institution: "Fundación Desarrollo Rural",
    description: "Certificación en habilidades de liderazgo para el desarrollo rural",
    competencies: [
      "Liderazgo comunitario",
      "Gestión de proyectos",
      "Resolución de conflictos",
      "Comunicación efectiva",
      "Trabajo en equipo",
    ],
    verificationCode: "MONT-LIDER-2023-015",
    digitalSignature: true,
  },
  {
    id: "CERT-2023-008",
    title: "Apicultura Básica",
    type: "capacitacion",
    category: "Apicultura",
    issueDate: "2023-08-15",
    expiryDate: "2023-08-15",
    status: "vencido",
    grade: 87,
    duration: 24,
    instructor: "Téc. María González",
    institution: "Cooperativa Apícola",
    description: "Certificación básica en manejo de colmenas y producción de miel",
    competencies: [
      "Manejo de colmenas",
      "Extracción de miel",
      "Sanidad apícola",
      "Comercialización de productos",
      "Seguridad en apicultura",
    ],
    verificationCode: "MONT-APIC-2023-008",
    digitalSignature: false,
  },
]

const tiposCertificado = [
  { value: "todos", label: "Todos los certificados" },
  { value: "capacitacion", label: "Capacitaciones" },
  { value: "programa", label: "Programas" },
  { value: "taller", label: "Talleres" },
  { value: "curso", label: "Cursos" },
]

const categorias = [
  "Todas",
  "Café",
  "Agricultura",
  "Ganadería",
  "Tecnología",
  "Liderazgo",
  "Apicultura",
  "Comercialización",
]

export default function CertificadosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("todos")
  const [selectedCategory, setSelectedCategory] = useState("Todas")
  const [selectedStatus, setSelectedStatus] = useState("todos")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vigente":
        return "bg-emerald-100 text-emerald-800"
      case "por_vencer":
        return "bg-yellow-100 text-yellow-800"
      case "vencido":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "capacitacion":
        return <GraduationCap className="w-4 h-4" />
      case "programa":
        return <Trophy className="w-4 h-4" />
      case "taller":
        return <Award className="w-4 h-4" />
      case "curso":
        return <FileText className="w-4 h-4" />
      default:
        return <Award className="w-4 h-4" />
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-emerald-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredCertificados = certificados.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.institution.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "todos" || cert.type === selectedType
    const matchesCategory = selectedCategory === "Todas" || cert.category === selectedCategory
    const matchesStatus = selectedStatus === "todos" || cert.status === selectedStatus

    return matchesSearch && matchesType && matchesCategory && matchesStatus
  })

  const estadisticas = {
    total: certificados.length,
    vigentes: certificados.filter((c) => c.status === "vigente").length,
    porVencer: certificados.filter((c) => c.status === "por_vencer").length,
    vencidos: certificados.filter((c) => c.status === "vencido").length,
    promedioCalificacion: Math.round(certificados.reduce((sum, c) => sum + c.grade, 0) / certificados.length),
    horasTotales: certificados.reduce((sum, c) => sum + c.duration, 0),
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
                <h1 className="text-xl font-semibold text-gray-900">Mis Certificados</h1>
                <p className="text-sm text-gray-600">Descarga y gestiona tus certificaciones</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Award className="w-3 h-3 mr-1" />
                {estadisticas.vigentes} Vigentes
              </Badge>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir Perfil
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.vigentes}</p>
                  <p className="text-sm text-gray-600">Vigentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.porVencer}</p>
                  <p className="text-sm text-gray-600">Por Vencer</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.vencidos}</p>
                  <p className="text-sm text-gray-600">Vencidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.promedioCalificacion}</p>
                  <p className="text-sm text-gray-600">Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.horasTotales}</p>
                  <p className="text-sm text-gray-600">Horas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar certificados..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposCertificado.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="vigente">Vigentes</SelectItem>
                  <SelectItem value="por_vencer">Por vencer</SelectItem>
                  <SelectItem value="vencido">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Vista de Tarjetas</TabsTrigger>
            <TabsTrigger value="list">Vista de Lista</TabsTrigger>
          </TabsList>

          {/* Vista de Tarjetas */}
          <TabsContent value="grid">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCertificados.map((certificado) => (
                <Card
                  key={certificado.id}
                  className="bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(certificado.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg line-clamp-2">{certificado.title}</CardTitle>
                          <CardDescription className="flex items-center space-x-2">
                            <span>{certificado.institution}</span>
                            <span>•</span>
                            <span>{certificado.category}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(certificado.status)}>
                          {certificado.status === "vigente"
                            ? "Vigente"
                            : certificado.status === "por_vencer"
                              ? "Por Vencer"
                              : "Vencido"}
                        </Badge>
                        {certificado.digitalSignature && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Shield className="w-3 h-3 mr-1" />
                            Digital
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-2">{certificado.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="font-medium text-gray-900">Instructor</p>
                        <p className="text-gray-600">{certificado.instructor}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Duración</p>
                        <p className="text-gray-600">{certificado.duration} horas</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Calificación</p>
                        <p className={`font-semibold ${getGradeColor(certificado.grade)}`}>{certificado.grade}/100</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Emisión</p>
                        <p className="text-gray-600">{new Date(certificado.issueDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-2">Competencias Certificadas</p>
                      <div className="flex flex-wrap gap-1">
                        {certificado.competencies.slice(0, 3).map((competencia, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {competencia}
                          </Badge>
                        ))}
                        {certificado.competencies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{certificado.competencies.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <p>Código: {certificado.verificationCode}</p>
                        {certificado.expiryDate && (
                          <p>Vence: {new Date(certificado.expiryDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Download className="w-4 h-4 mr-2" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vista de Lista */}
          <TabsContent value="list">
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Certificado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Calificación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Emisión
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCertificados.map((certificado) => (
                        <tr key={certificado.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                {getTypeIcon(certificado.type)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {certificado.title}
                                </div>
                                <div className="text-sm text-gray-500">{certificado.institution}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{certificado.category}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Star className={`w-4 h-4 mr-1 ${getGradeColor(certificado.grade)}`} />
                              <span className={`font-semibold ${getGradeColor(certificado.grade)}`}>
                                {certificado.grade}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(certificado.status)}>
                              {certificado.status === "vigente"
                                ? "Vigente"
                                : certificado.status === "por_vencer"
                                  ? "Por Vencer"
                                  : "Vencido"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(certificado.issueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {filteredCertificados.length === 0 && (
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron certificados</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </CardContent>
          </Card>
        )}

        {/* Información adicional */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-emerald-900 mb-2">Certificados Digitales Verificables</h3>
                <div className="text-emerald-800 space-y-2">
                  <p>• Todos los certificados incluyen firma digital y código de verificación único</p>
                  <p>• Descarga en formato PDF de alta calidad para impresión</p>
                  <p>• Comparte tu perfil profesional con empleadores y socios</p>
                  <p>• Recibe notificaciones antes del vencimiento de certificaciones</p>
                </div>
                <div className="flex items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-transparent"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Verificar Certificado
                  </Button>
                  <Button
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 bg-transparent"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Todo
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
