import api from '@/lib/api'

export interface SystemStatsDto {
  totalUsuarios: number
  programasActivos: number
  presupuestoTotal: number
  veredasActivas: number
  totalVeredas: number
}

export const adminStatsService = {
  fetch: async (): Promise<SystemStatsDto> => {
    const usersRes = await api.get('/users')
    const users = Array.isArray(usersRes.data) ? usersRes.data : []

    const programsRes = await api.get('/programas/', { params: { limit: 1000 } })
    const programs = Array.isArray(programsRes.data.programs) ? programsRes.data.programs : []

    const programasActivos = programs.filter((p: any) => p.estado === 'activo').length
    const presupuestoTotal = programs.reduce((sum: number, p: any) => sum + (Number(p.presupuesto || 0)), 0)
    const veredasSet = new Set<string>()
    programs.forEach((p: any) => {
      (p.ubicaciones || []).forEach((v: string) => veredasSet.add(v))
    })

    return {
      totalUsuarios: users.length,
      programasActivos,
      presupuestoTotal,
      veredasActivas: veredasSet.size,
      totalVeredas: veredasSet.size // si hay catálogo de veredas se puede cambiar
    }
  }
}