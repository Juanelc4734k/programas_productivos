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
    const { data } = await api.get('/reports/export', { params: { type: params.type, from, to, programId, search, format }, responseType: 'blob' })
    return data
  }
}