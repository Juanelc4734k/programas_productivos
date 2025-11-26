import Program from '../programs/programs.model.js'
import Tramite from '../digitalProcedures/tramite.model.js'
import fs from 'fs'
import path from 'path'
import os from 'os'

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
        const buildOverviewPdfHtml = (payload) => {
          const titulo = `Reporte ${type}`
          const desde = payload.dateRange.from || ''
          const hasta = payload.dateRange.to || ''
          return `<!doctype html><html><head><meta charset="utf-8"><meta name="author" content="Plataforma Montebello"><meta name="title" content="${titulo}"><title>${titulo}</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px}h1{font-size:18px;margin:0 0 12px}p.meta{font-size:12px;color:#555;margin:4px 0}table{border-collapse:collapse;width:100%}thead th{background:#f3f4f6;color:#111;border:1px solid #e5e7eb;padding:8px;font-size:12px;text-align:left}tbody td{border:1px solid #e5e7eb;padding:8px;font-size:12px}section.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}section.grid .card{border:1px solid #e5e7eb;padding:10px;border-radius:6px;background:#fafafa}section.grid .card .label{font-size:11px;color:#374151}section.grid .card .value{font-size:16px;color:#111;font-weight:600}</style></head><body><h1>${titulo}</h1><p class="meta">Periodo: ${desde} — ${hasta}</p><section class="grid"><div class="card"><div class="label">Beneficiarios asignados</div><div class="value">${payload.beneficiariesAssigned}</div></div><div class="card"><div class="label">Programas activos</div><div class="value">${payload.activePrograms}</div></div><div class="card"><div class="label">Trámites pendientes</div><div class="value">${payload.pendingProcedures}</div></div></section><table><thead><tr><th>Indicador</th><th>Valor</th></tr></thead><tbody><tr><td>Beneficiarios asignados</td><td>${payload.beneficiariesAssigned}</td></tr><tr><td>Programas activos</td><td>${payload.activePrograms}</td></tr><tr><td>Trámites pendientes</td><td>${payload.pendingProcedures}</td></tr><tr><td>Desde</td><td>${desde}</td></tr><tr><td>Hasta</td><td>${hasta}</td></tr></tbody></table></body></html>`
        }
        const html = buildOverviewPdfHtml(dataResponse)
        const puppeteer = await import('puppeteer')

        const commonWindowsPaths = [
          'C:/Program Files/Google/Chrome/Application/chrome.exe',
          'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
          path.join(process.env.LOCALAPPDATA || 'C:/Users', 'Google/Chrome/Application/chrome.exe')
        ]
        const envPath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH
        let resolvedPath = envPath && fs.existsSync(envPath) ? envPath : commonWindowsPaths.find(p => { try { return fs.existsSync(p) } catch { return false } })
        if (!resolvedPath) {
          try {
            const home = os.userInfo().homedir
            const cacheRoot = path.join(home, '.cache', 'puppeteer', 'chrome')
            const platforms = fs.existsSync(cacheRoot) ? fs.readdirSync(cacheRoot) : []
            for (const plat of platforms) {
              const candidate = path.join(cacheRoot, plat, 'chrome-win64', 'chrome.exe')
              if (fs.existsSync(candidate)) { resolvedPath = candidate; break }
            }
          } catch {}
        }

        let browser
        try {
          browser = await puppeteer.launch({ headless: true, channel: 'chrome', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] })
        } catch {
          if (!resolvedPath) throw new Error('Chrome no encontrado. Configura CHROME_PATH o instala Chrome.')
          browser = await puppeteer.launch({ headless: true, executablePath: resolvedPath, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-gpu'] })
        }
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '15mm', right: '12mm', bottom: '15mm', left: '12mm' } })
        await browser.close()
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Length', String(pdfBuffer.length))
        const fileName = `reporte-${type}-${new Date().toISOString().slice(0,10)}.pdf`
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
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
