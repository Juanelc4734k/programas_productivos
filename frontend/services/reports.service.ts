import api from '@/lib/api'

export interface ReportParams {
  type: 'overview'
  from?: string
  to?: string
  programId?: string
  search?: string
}

export interface OverviewReport {
  beneficiariesAssigned: number
  activePrograms: number
  pendingProcedures: number
  dateRange: { from?: string; to?: string }
}

export const reportsService = {
  getOverview: async (params: ReportParams): Promise<OverviewReport> => {
    const { from, to, programId, search } = params
    const { data } = await api.get('/reports/overview', { params: { from, to, programId, search } })
    return data
  },
  export: async (params: ReportParams & { format: 'csv' | 'xls' | 'pdf' }): Promise<Blob> => {
    const { from, to, programId, search, format } = params
    const res = await api.get('/reports/export', {
      params: { type: params.type, from, to, programId, search, format },
      responseType: 'blob',
      headers: { Accept: 'application/pdf,text/csv,application/vnd.ms-excel' }
    })
    const blob: Blob = res.data
    if (blob && (blob.type === 'application/json' || blob.type === 'text/plain')) {
      const text = await blob.text().catch(() => '')
      try {
        const obj = JSON.parse(text)
        throw new Error(obj?.message || 'Error al exportar reporte')
      } catch {
        throw new Error(text || 'Error al exportar reporte')
      }
    }
    return blob
  }
}
