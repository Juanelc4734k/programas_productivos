"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, FileText, Calendar, Coffee, Wheat, Eye, Upload, CheckCircle } from "lucide-react"
import { fetchProgramsByCampesino } from "@/services/programs.service"
import { tramitesService } from "@/services/tramite.service"



export function MainDashboard() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [tramites, setTramites] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = localStorage.getItem('token');
  let decodedToken = null;

  if (token) {
    try {
      decodedToken = JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const campesinoId = decodedToken ? decodedToken.id : null;


  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const data = await fetchProgramsByCampesino(campesinoId);
        if (Array.isArray(data) && data.length > 0) {
          setPrograms(data);
          setErrorMessage(null); // Limpia el mensaje de error si hay programas
        } else {
          setPrograms([]);
          setErrorMessage("No se encontraron programas para este campesino"); // Establece el mensaje de error
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
        setErrorMessage("Error al cargar los programas"); // Mensaje de error genérico
      }
    };

    const loadTramites = async () => {
      try {
        const data = await tramitesService.listarMisTramites();
        if (Array.isArray(data) && data.length > 0) {
          setTramites(data);
          setErrorMessage(null); // Limpia el mensaje de error si hay trámites
        } else {
          setTramites([]);
          setErrorMessage("No se encontraron trámites para este campesino"); // Establece el mensaje de error
        } 
      } catch (error) {
        console.error("Error fetching tramites:", error);
        setTramites([]);
        setErrorMessage("Error al cargar los trámites"); // Mensaje de error genérico
      }
    }
    loadPrograms();
    loadTramites();
  }, []);

  const stats = [
    {
      title: "Programas Activos",
      value: programs.length || 0,
      change: "+2",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      title: "Beneficiarios",
      value: programs.reduce((total, program) => total + (program.inscritos?.length || 0), 0) || 0,
      change: "+156",
      icon: Users,
      color: "blue",
    },
    {
      title: "Trámites Pendientes",
      value: tramites.filter(tramite => tramite.estado === 'submitted' || tramite.estado === 'in_review').length || 0,
      change: "-5",
      icon: FileText,
      color: "amber",
    },
    {
      title: "Capacitaciones",
      value: "8",
      change: "+3",
      icon: Calendar,
      color: "purple",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="bg-white border border-gray-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="w-full sm:w-auto">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs ${stat.change.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                      {stat.change} este mes
                    </p>
                  </div>
                  <div
                    className={`w-8 h-8 sm:w-12 sm:h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mt-2 sm:mt-0 self-end sm:self-auto`}
                  >
                    <IconComponent className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Mis programas */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">Mis Programas</CardTitle>
            <Link href="/user/programs">
              <Button variant="outline" size="sm">
                Ver todos
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 sm:space-y-6">
            {errorMessage ? (
                <p className="text-sm text-gray-600">{errorMessage}</p> // Muestra el mensaje de error
              ) : (
                programs.map((program) => {
                  const IconComponent = program.icon || Coffee; // Default to Coffee icon if undefined
                  return (
                    <div
                      key={program._id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 bg-${program.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 text-${program.color}-600`} />
                        </div>
  
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{program.nombre}</h3>
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 self-start sm:self-auto"
                            >
                              {program.estado}
                            </Badge>
                          </div>
  
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{program.descripcion}</p>
  
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progreso</p>
                              <div className="mt-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-900">{program.progreso}%</span>
                                </div>
                                <Progress value={program.progreso} className="h-2" />
                              </div>
                            </div>
  
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Beneficiarios</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">{program.cupos} familias</p>
                            </div>
                          </div>
  
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <Link href={`/user/programs/${program._id}`}>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                                <Eye className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Ver detalles</span>
                                <span className="sm:hidden">Detalles</span>
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <Upload className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Subir evidencia</span>
                              <span className="sm:hidden">Evidencia</span>
                            </Button>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Reportar avance</span>
                              <span className="sm:hidden">Avance</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
