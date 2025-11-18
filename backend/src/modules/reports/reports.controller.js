import Program from '../programs/programs.model.js'
import Tramite from '../digitalProcedures/tramite.model.js'

export const overviewReport = async (req, res) => {
  try {
    const { from, to, programId, search } = req.query
    const dateFilter = {}
    if (from) dateFilter.$gte = new Date(from)
    if (to) dateFilter.$lte = new Date(to)

    let programsQuery = Program.find()
    if (programId) programsQuery = Program.find({ _id: programId })
    if (Object.keys(dateFilter).length) programsQuery = programsQuery.where({ createdAt: dateFilter })

    const programs = await programsQuery.select('inscritos estado createdAt').lean()
    const beneficiariesAssigned = new Set()
    for (const p of programs) {
      for (const u of (p.inscritos || [])) beneficiariesAssigned.add(String(u))
    }
    const activePrograms = programs.filter(p => p.estado === 'activo').length

    let tramitesQuery = Tramite.find()
    if (Object.keys(dateFilter).length) tramitesQuery = tramitesQuery.where({ fecha_solicitud: dateFilter })
    if (search) {
      const r = new RegExp(search, 'i')
      tramitesQuery = tramitesQuery.where({ $or: [{ titulo: r }, { descripcion: r }, { vereda: r }] })
    }
    const tramites = await tramitesQuery.select('estado').lean()
    const pendingProcedures = tramites.filter(t => t.estado === 'submitted' || t.estado === 'in_review').length

    return res.status(200).json({ beneficiariesAssigned: beneficiariesAssigned.size, activePrograms, pendingProcedures, dateRange: { from, to } })
  } catch (error) {
    return res.status(500).json({ message: 'Error al generar reporte', error: error.message })
  }
}

export const exportReport = async (req, res) => {
  try {
    const { type = 'overview', format = 'csv' } = req.query
    if (type !== 'overview') return res.status(400).json({ message: 'Tipo de reporte no soportado' })

    req.query.search = req.query.search || undefined
    const dataResponse = await overviewReportData(req)

    if (format === 'csv' || format === 'xls') {
      const header = ['beneficiarios_asignados','programas_activos','tramites_pendientes','desde','hasta']
      const row = [String(dataResponse.beneficiariesAssigned), String(dataResponse.activePrograms), String(dataResponse.pendingProcedures), dataResponse.dateRange.from || '', dataResponse.dateRange.to || '']
      const escapeCell = (v) => {
        const s = String(v ?? '')
        const needs = /[",\n]/.test(s)
        const e = s.replace(/"/g, '""')
        return needs ? `"${e}"` : e
      }
      const bom = '\uFEFF'
      const csv = bom + [header.map(escapeCell).join(','), row.map(escapeCell).join(',')].join('\n')
      res.setHeader('Content-Type', format === 'xls' ? 'application/vnd.ms-excel; charset=utf-8' : 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="reporte-${type}.${format}"`)
      return res.status(200).send(csv)
    }

    if (format === 'pdf') {
      try {
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Reporte</title><style>body{font-family:sans-serif}h1{font-size:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:6px;text-align:left}</style></head><body><h1>Reporte ${type}</h1><table><tr><th>Beneficiarios asignados</th><th>Programas activos</th><th>Trámites pendientes</th><th>Desde</th><th>Hasta</th></tr><tr><td>${dataResponse.beneficiariesAssigned}</td><td>${dataResponse.activePrograms}</td><td>${dataResponse.pendingProcedures}</td><td>${dataResponse.dateRange.from || ''}</td><td>${dataResponse.dateRange.to || ''}</td></tr></table></body></html>`
        const puppeteer = await import('puppeteer')
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] })
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
        await browser.close()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="reporte-${type}.pdf"`)
        return res.status(200).send(pdfBuffer)
      } catch (e) {
        return res.status(500).json({ message: 'Error generando PDF', error: e.message })
      }
    }

    return res.status(400).json({ message: 'Formato no soportado' })
  } catch (error) {
    return res.status(500).json({ message: 'Error al exportar reporte', error: error.message })
  }
}

const overviewReportData = async (req) => {
  const { from, to, programId, search } = req.query
  const dateFilter = {}
  if (from) dateFilter.$gte = new Date(from)
  if (to) dateFilter.$lte = new Date(to)

  let programsQuery = Program.find()
  if (programId) programsQuery = Program.find({ _id: programId })
  if (Object.keys(dateFilter).length) programsQuery = programsQuery.where({ createdAt: dateFilter })

  const programs = await programsQuery.select('inscritos estado createdAt').lean()
  const beneficiariesAssigned = new Set()
  for (const p of programs) {
    for (const u of (p.inscritos || [])) beneficiariesAssigned.add(String(u))
  }
  const activePrograms = programs.filter(p => p.estado === 'activo').length

  let tramitesQuery = Tramite.find()
  if (Object.keys(dateFilter).length) tramitesQuery = tramitesQuery.where({ fecha_solicitud: dateFilter })
  if (search) {
    const r = new RegExp(search, 'i')
    tramitesQuery = tramitesQuery.where({ $or: [{ titulo: r }, { descripcion: r }, { vereda: r }] })
  }
  const tramites = await tramitesQuery.select('estado').lean()
  const pendingProcedures = tramites.filter(t => t.estado === 'submitted' || t.estado === 'in_review').length
  return { beneficiariesAssigned: beneficiariesAssigned.size, activePrograms, pendingProcedures, dateRange: { from, to } }
}