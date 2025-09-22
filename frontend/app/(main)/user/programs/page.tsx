"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Coffee,
  Wheat,
  Heart,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  Leaf,
  MilkIcon as Cow,
  ArrowLeft,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { fetchPrograms, enrollUserInProgram, unenrollUserFromProgram } from "@/services/programs.service"
import { useAuthContext } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState<string | null>(null);
  
  const { user } = useAuthContext();
  const { toast } = useToast();

  function formatNumber(value: number): string {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
      return value.toString();
    }
  }

  // Verificar si el usuario está inscrito en un programa
  const isUserEnrolled = (program: any) => {
    if (!user || !program.inscritos) return false;
    return program.inscritos.some((inscrito: any) => inscrito._id === user._id);
  };

  // Manejar inscripción en programa
  const handleEnrollment = async (programId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para inscribirte en un programa",
        variant: "destructive",
      });
      return;
    }

    try {
      setEnrollmentLoading(programId);
      await enrollUserInProgram(programId, user._id);
      
      // Actualizar la lista de programas
      const updatedPrograms = programs.map(program => {
        if (program._id === programId) {
          return {
            ...program,
            inscritos: [...(program.inscritos || []), user]
          };
        }
        return program;
      });
      setPrograms(updatedPrograms);
      
      toast({
        title: "¡Inscripción exitosa!",
        description: "Te has inscrito correctamente en el programa",
      });
    } catch (error: any) {
      toast({
        title: "Error al inscribirse",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEnrollmentLoading(null);
    }
  };

  // Manejar desinscripción del programa
  const handleUnenrollment = async (programId: string) => {
    if (!user) return;

    try {
      setEnrollmentLoading(programId);
      await unenrollUserFromProgram(programId, user._id);
      
      // Actualizar la lista de programas
      const updatedPrograms = programs.map(program => {
        if (program._id === programId) {
          return {
            ...program,
            inscritos: (program.inscritos || []).filter((inscrito: any) => inscrito._id !== user._id)
          };
        }
        return program;
      });
      setPrograms(updatedPrograms);
      
      toast({
        title: "Desinscripción exitosa",
        description: "Te has desinscrito correctamente del programa",
      });
    } catch (error: any) {
      toast({
        title: "Error al desinscribirse",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEnrollmentLoading(null);
    }
  };

  // Renderizar botón de inscripción
  const renderEnrollmentButton = (program: any) => {
    const isEnrolled = isUserEnrolled(program);
    const isLoading = enrollmentLoading === program._id;

    if (isLoading) {
      return (
        <Button size="sm" disabled className="bg-gray-400">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Procesando...
        </Button>
      );
    }

    if (isEnrolled) {
      return (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleUnenrollment(program._id)}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          <UserX className="w-4 h-4 mr-2" />
          Desinscribirse
        </Button>
      );
    }

    return (
      <Button 
        size="sm" 
        onClick={() => handleEnrollment(program._id)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <UserCheck className="w-4 h-4 mr-2" />
        Inscribirse
      </Button>
    );
  };
  

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const data = await fetchPrograms();
        if (Array.isArray(data) && data.length > 0) {
          setPrograms(data);
          setErrorMessage(null);
        } else {
          setPrograms([]);
          setErrorMessage("No se encontraron programas disponibles");
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
        setErrorMessage("Error al cargar los programas");
      } finally {
        setIsLoading(false);
      }
    };
    loadPrograms();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activo":
        return "bg-emerald-100 text-emerald-800"
      case "en curso":
        return "bg-blue-100 text-blue-800"
      case "en espera":
        return "bg-yellow-100 text-yellow-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      case "suspendido":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (isLoading) {
    return <p>Cargando programas...</p>; // Muestra un mensaje de carga mientras se obtienen los datos
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
                <h1 className="text-xl font-semibold text-gray-900">Programas Productivos</h1>
                <p className="text-sm text-gray-600">Descubre y participa en nuestros programas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                {programs.length} Programas Activos
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage ? (
          <p className="text-sm text-gray-600">{errorMessage}</p>
        ) : (
          <>
            {/* Estadísticas generales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                      {programs.reduce((total, program) => total + (program.inscritos?.length || 0), 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Beneficiarios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                      <p className="text-sm text-gray-600">Veredas Cubiertas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                      {programs.length > 0 ? new Date(programs[0].fecha_inicio).getFullYear() : "N/A"}
                      </p>
                      <p className="text-sm text-gray-600">Año de Ejecución</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(
                        programs.reduce((total, program) => total + (program.presupuesto || 0), 0)
                      )}
                      </p>
                      <p className="text-sm text-gray-600">Inversión Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de programas */}
            <div className="space-y-8">
              {programs?.length > 0 && programs.map((program) => {
                const IconComponent = program.icon || Coffee; // Default icon if none is specified
                return (
                  <Card key={program._id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-8 h-8 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl text-gray-900">{program.nombre}</CardTitle>
                            <CardDescription className="text-gray-600 mt-1">{program.descripcion}</CardDescription>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge className={getStatusColor(program.estado)}>{program.estado}</Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(program.fecha_inicio).getFullYear()} - {new Date(program.fecha_fin).getFullYear()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">${formatNumber(program.presupuesto)}</p>
                          <p className="text-sm text-gray-600">Presupuesto asignado</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Información básica */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Información General</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{program.cupos} beneficiarios</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span>{program.ubicaciones?.join(", ") || "Ubicación no disponible"}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              <span>
                                {new Date(program.fecha_inicio).toLocaleDateString()} -{" "}
                                {new Date(program.fecha_fin).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progreso del programa</span>
                              <span>{program.progreso}%</span>
                            </div>
                            <Progress value={program.progreso} className="h-2" />
                          </div>
                        </div>

                        {/* Beneficios */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Beneficios Incluidos</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {Array.isArray(program.beneficios) && program.beneficios.length > 0 ? (
                              program.beneficios.map((benefit: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{benefit}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500">No hay beneficios disponibles</li>
                            )}
                          </ul>
                        </div>

                        {/* Requisitos */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Requisitos</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {Array.isArray(program.requisitos) && program.requisitos.length > 0 ? (
                              program.requisitos.map((req: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2 mt-0.5 flex-shrink-0"></div>
                                  <span>{req}</span>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500">No hay requisitos disponibles</li>
                            )}
                          </ul>
                        </div>

                        {/* Ubicaciones */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Ubicaciones</h4>
                          <p className="text-sm text-gray-600">
                            {Array.isArray(program.ubicaciones) && program.ubicaciones.length > 0
                              ? program.ubicaciones.join(", ")
                              : "Ubicación no disponible"}
                          </p>
                        </div>
                      </div>

                      {/* Testimonial */}
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="flex items-start">
                          <Heart className="w-5 h-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 mb-1">Testimonios de beneficiarios</h5>
                            {Array.isArray(program.testimonios) && program.testimonios.length > 0 ? (
                              program.testimonios.map((testimonio, index) => (
                                <div key={testimonio._id || index} className="mb-2">
                                  <p className="text-gray-700 italic">"{testimonio.texto}"</p>
                                  <p className="text-sm text-gray-500">- {testimonio.autor}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500">No hay testimonios disponibles</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Última actualización: Hace 2 días</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Link href={`/user/programs/${program._id}`}>
                            <Button variant="outline" size="sm">
                              Ver Detalles
                            </Button>
                          </Link>
                          {renderEnrollmentButton(program)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* Información de contacto */}
        <Card className="bg-white border border-gray-200 mt-12">
          <CardHeader>
            <CardTitle className="text-center">¿Necesitas más información?</CardTitle>
            <CardDescription className="text-center">
              Nuestro equipo está disponible para resolver todas tus dudas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Teléfono</h4>
                <p className="text-gray-600">(123) 456-7890</p>
                <p className="text-sm text-gray-500">Lun-Vie: 7AM-5PM</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Oficina</h4>
                <p className="text-gray-600">Alcaldía Municipal</p>
                <p className="text-sm text-gray-500">Centro de Montebello</p>
              </div>
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">WhatsApp</h4>
                <p className="text-gray-600">300-123-4567</p>
                <p className="text-sm text-gray-500">Respuesta rápida</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
