"use client"

import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, FileText, Calendar, Coffee, Wheat, Eye, Upload, CheckCircle } from "lucide-react"
import { fetchProgramsByCampesino, subirEvidencia, reportarAvance } from "@/services/programs.service"
import { tramitesService } from "@/services/tramite.service"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"


export function MainDashboard() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [tramites, setTramites] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const token = localStorage.getItem('token');
  const { toast } = useToast();

  const [isEvidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [isProgressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const evidenceInputRef = useRef<HTMLInputElement | null>(null);

  const [progressDescripcion, setProgressDescripcion] = useState("");
  const [progressPorcentaje, setProgressPorcentaje] = useState<number | "">("");
  const [progressFecha, setProgressFecha] = useState<string>("");

  const openEvidenceModal = (programId: string) => {
        setSelectedProgramId(programId);
        setEvidenceDialogOpen(true);
    };

    const openProgressModal = (programId: string) => {
        setSelectedProgramId(programId);
        setProgressDialogOpen(true);
    };

    const resetEvidenceState = () => {
        setEvidenceFile(null);
        setIsDragActive(false);
    };

    const resetProgressState = () => {
        setProgressDescripcion("");
        setProgressPorcentaje("");
        setProgressFecha("");
    };

    const handleEvidenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setEvidenceFile(file);
    };

    const handleEvidenceDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleEvidenceDragLeave = () => {
        setIsDragActive(false);
    };

    const handleEvidenceDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        const file = e.dataTransfer.files?.[0] || null;
        setEvidenceFile(file);
    };

    const confirmUploadEvidence = async () => {
        if (!selectedProgramId || !evidenceFile) {
            toast({
                title: "Archivo requerido",
                description: "Selecciona un archivo antes de confirmar.",
                variant: "destructive",
            });
            return;
        }
        try {
            await subirEvidencia(selectedProgramId, evidenceFile);
            toast({ title: "Evidencia subida", description: "Archivo guardado correctamente." });
            setEvidenceDialogOpen(false);
            resetEvidenceState();
        } catch (error: any) {
            toast({
                title: "Error al subir evidencia",
                description: error?.message || "Intente nuevamente.",
                variant: "destructive",
            });
        }
    };

    const cancelUploadEvidence = () => {
        setEvidenceDialogOpen(false);
        resetEvidenceState();
    };

    const confirmReportProgress = async () => {
        if (!selectedProgramId || progressPorcentaje === "" || Number(progressPorcentaje) < 0 || Number(progressPorcentaje) > 100) {
            toast({
                title: "Porcentaje inválido",
                description: "Debe estar entre 0 y 100.",
                variant: "destructive",
            });
            return;
        }
        try {
            await reportarAvance(
                selectedProgramId,
                Number(progressPorcentaje),
                progressDescripcion || undefined,
                progressFecha || undefined
            );
            toast({ title: "Avance reportado", description: `Progreso actualizado a ${progressPorcentaje}%` });
            setProgressDialogOpen(false);
            resetProgressState();
        } catch (error: any) {
            toast({
                title: "Error al reportar avance",
                description: error?.message || "Intente nuevamente.",
                variant: "destructive",
            });
        }
    };

    const cancelReportProgress = () => {
        setProgressDialogOpen(false);
        resetProgressState();
    };

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


    loadPrograms();

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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cupos disponibles</p>
                              <p className="text-sm font-medium text-gray-900 mt-1">{program.cupos}</p>
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
                            <label htmlFor={`evidencia-${program._id}`} className="w-full sm:w-auto">
                              <Button size="sm" variant="outline" className="w-full sm:w-auto" onClick={() => openEvidenceModal(program._id)}>
                                <Upload className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Subir evidencia</span>
                                <span className="sm:hidden">Evidencia</span>
                              </Button>
                            </label>

                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => openProgressModal(program._id)}
                            >
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
      {/* Modal: Subir evidencia */}
            <Dialog open={isEvidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Subir evidencia</DialogTitle>
                        <DialogDescription>Arrastra tu archivo o selecciónalo manualmente.</DialogDescription>
                    </DialogHeader>

                    <div
                        className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                            isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300"
                        }`}
                        onDragOver={handleEvidenceDragOver}
                        onDragEnter={handleEvidenceDragOver}
                        onDragLeave={handleEvidenceDragLeave}
                        onDrop={handleEvidenceDrop}
                    >
                        <p className="text-sm text-gray-700 mb-2">
                            Arrastra y suelta el archivo aquí
                        </p>
                        <p className="text-xs text-gray-500 mb-4">Formatos permitidos: imágenes, PDF, Word</p>
                        <Button
                            variant="outline"
                            onClick={() => evidenceInputRef.current?.click()}
                            type="button"
                        >
                            Seleccionar archivo
                        </Button>
                        <input
                            ref={evidenceInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleEvidenceSelect}
                        />

                        {evidenceFile && (
                            <div className="mt-4 text-sm text-gray-800">
                                Archivo seleccionado: <span className="font-medium">{evidenceFile.name}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={cancelUploadEvidence}>Cancelar</Button>
                        <Button onClick={confirmUploadEvidence} disabled={!evidenceFile}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Modal: Reportar avance */}
            <Dialog open={isProgressDialogOpen} onOpenChange={setProgressDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Reportar avance</DialogTitle>
                        <DialogDescription>Completa los campos para actualizar el progreso.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="descripcion">Descripción del progreso</Label>
                            <Textarea
                                id="descripcion"
                                value={progressDescripcion}
                                onChange={(e) => setProgressDescripcion(e.target.value)}
                                placeholder="Describe el avance realizado"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="porcentaje">Porcentaje completado</Label>
                            <Input
                                id="porcentaje"
                                type="number"
                                min={0}
                                max={100}
                                value={progressPorcentaje}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setProgressPorcentaje(val === "" ? "" : Number(val));
                                }}
                                placeholder="0 - 100"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="fecha">Fecha de actualización</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={progressFecha}
                                onChange={(e) => setProgressFecha(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={cancelReportProgress}>Cancelar</Button>
                        <Button onClick={confirmReportProgress} disabled={progressPorcentaje === ""}>
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </div>
    
  );
}
