"use client"
import React from 'react'

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react"
import { beneficiariesService } from "@/services/beneficiaries.service"
import type { 
  BeneficiaryWithPrograms, 
  BeneficiariesFilters, 
  BeneficiaryStats 
} from "@/types/beneficiaries"

interface BeneficiariesManagementProps {
  programId: string
  programName?: string
}

export default function BeneficiariesManagement({ programId, programName }: BeneficiariesManagementProps) {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryWithPrograms[]>([])
  const [stats, setStats] = useState<BeneficiaryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryWithPrograms | null>(null)
  const [veredas, setVeredas] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const debounceRef = useRef<number | null>(null)
  
  // Filtros y paginación
  const [filters, setFilters] = useState<BeneficiariesFilters>({
    search: '',
    estado: 'todos',
    vereda: 'all',
    page: 1,
    limit: 10
  })
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Beneficiarios: depende de filtros y programa
  useEffect(() => {
    loadBeneficiaries()
  }, [programId, filters])

  // Stats: solo depende del programa
  useEffect(() => {
    loadStats()
  }, [programId])

  // Veredas: depende del programa, con fallback interno
  useEffect(() => {
    loadVeredas()
  }, [programId])

  const loadBeneficiaries = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await beneficiariesService.getBeneficiariesByProgram(programId, filters)
      
      if (response.success) {
        setBeneficiaries(response.data.beneficiaries)
        setTotalPages(response.data.totalPages)
        setTotal(response.data.total)
      } else {
        setError(response.message || 'Error al cargar beneficiarios')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar beneficiarios')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await beneficiariesService.getBeneficiariesStats(programId)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadVeredas = async () => {
    try {
      const veredasData = await beneficiariesService.getVeredas()
      if (veredasData && veredasData.length > 0) {
        setVeredas(veredasData)
      } else {
        const fromStats = stats ? Object.keys(stats.porVereda || {}) : []
        const fromBeneficiaries = Array.from(new Set(beneficiaries.map(b => b.vereda).filter(Boolean))) as string[]
        const combined = Array.from(new Set([...(fromStats || []), ...(fromBeneficiaries || [])])) as string[]
        setVeredas(combined)
      }
    } catch (err) {
      console.error('Error loading veredas:', err)
    }
  }

  const handleSearch = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current)
    }
    debounceRef.current = window.setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }))
    }, 400)
  }

  const handleFilterChange = (key: keyof BeneficiariesFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleStatusChange = async (beneficiaryId: string, newStatus: 'activo' | 'inactivo') => {
    try {
      await beneficiariesService.updateBeneficiaryStatus(beneficiaryId, newStatus)
      loadBeneficiaries() // Recargar datos
      loadStats() // Actualizar estadísticas
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado')
    }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const blob = await beneficiariesService.exportBeneficiaries(programId, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ext = format === 'excel' ? 'xls' : format
      a.download = `beneficiarios-${programName || programId}.${ext}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al exportar datos')
    }
  }

  const getStatusBadge = (estado: string) => {
    return estado === 'activo' 
      ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
      : <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactivo</Badge>
  }

  

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gestión de Beneficiarios
            {programName && <span className="ml-2 text-sm font-normal text-gray-600">- {programName}</span>}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadBeneficiaries()}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Select onValueChange={(value) => handleExport(value as 'csv' | 'excel' | 'pdf')}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Exportar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <CardDescription>
          Administra y da seguimiento a los beneficiarios del programa
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-emerald-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-emerald-800">{stats.total}</p>
                    <p className="text-sm text-emerald-600">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-green-800">{stats.activos}</p>
                    <p className="text-sm text-green-600">Activos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <UserX className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-red-800">{stats.inactivos}</p>
                    <p className="text-sm text-red-600">Inactivos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <MapPin className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-blue-800">{Object.keys(stats.porVereda).length}</p>
                    <p className="text-sm text-blue-600">Veredas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, documento o correo..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filters.estado} onValueChange={(value) => handleFilterChange('estado', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.vereda} onValueChange={(value) => handleFilterChange('vereda', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Vereda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las veredas</SelectItem>
              {veredas.map((vereda) => (
                <SelectItem key={vereda} value={vereda}>{vereda}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de beneficiarios */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Beneficiario</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Vereda</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Programas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {loading ? 'Cargando...' : 'No se encontraron beneficiarios'}
                  </TableCell>
                </TableRow>
              ) : (
                beneficiaries.map((beneficiary) => (
                  <TableRow key={beneficiary._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{beneficiary.nombre}</p>
                        <p className="text-sm text-gray-500">
                          Registrado: {new Date(beneficiary.fecha_registro).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{beneficiary.documento_identidad}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {beneficiary.correo}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {beneficiary.telefono}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        {beneficiary.vereda || 'No especificada'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(beneficiary.estado)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {beneficiary.totalProgramas || 0} programa(s)
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBeneficiary(beneficiary)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Detalles del Beneficiario</DialogTitle>
                              <DialogDescription>
                                Información completa de {beneficiary.nombre}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBeneficiary && (
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                                  <p className="text-sm text-gray-900">{selectedBeneficiary.nombre}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Documento</label>
                                  <p className="text-sm text-gray-900">{selectedBeneficiary.documento_identidad}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                                  <p className="text-sm text-gray-900">{selectedBeneficiary.correo}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                                  <p className="text-sm text-gray-900">{selectedBeneficiary.telefono}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Vereda</label>
                                  <p className="text-sm text-gray-900">{selectedBeneficiary.vereda || 'No especificada'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Estado</label>
                                  <p className="text-sm text-gray-900">{getStatusBadge(selectedBeneficiary.estado)}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-gray-700">Dirección</label>
                                  <p className="text-sm text-gray-900">{selectedBeneficiary.direccion || 'No especificada'}</p>
                                </div>
                                <div className="col-span-2">
                                  <label className="text-sm font-medium text-gray-700">Programas inscritos</label>
                                  <div className="mt-2 space-y-2">
                                    {selectedBeneficiary.programas?.map((programa) => (
                                      <div key={programa._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm">{programa.nombre}</span>
                                        <Badge variant="outline" className="text-xs">{programa.estado}</Badge>
                                      </div>
                                    )) || <p className="text-sm text-gray-500">No hay programas registrados</p>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(
                            beneficiary._id, 
                            beneficiary.estado === 'activo' ? 'inactivo' : 'activo'
                          )}
                          className={beneficiary.estado === 'activo' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {beneficiary.estado === 'activo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700">
              Mostrando {((filters.page || 1) - 1) * (filters.limit || 10) + 1} a{' '}
              {Math.min((filters.page || 1) * (filters.limit || 10), total)} de {total} beneficiarios
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((filters.page || 1) - 1)}
                disabled={filters.page === 1}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {filters.page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((filters.page || 1) + 1)}
                disabled={filters.page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
