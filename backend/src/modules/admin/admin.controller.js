import Program from '../programs/programs.model.js';
import Project from '../programs/projects.model.js';
import User from '../auth/user.model.js';
import * as adminService from './admin.service.js';
import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

/**
 * Generar reporte general de todos los programas
 */
const getGeneralReport = async (req, res) => {
  try {
    const { startDate, endDate, estado, categoria } = req.query;
    
    // Construir filtros
    const filters = {};
    if (startDate || endDate) {
      filters.fecha_inicio = {};
      if (startDate) filters.fecha_inicio.$gte = new Date(startDate);
      if (endDate) filters.fecha_inicio.$lte = new Date(endDate);
    }
    if (estado) filters.estado = estado;
    if (categoria) filters.categoria = categoria;

    const programs = await Program.find(filters)
      .populate('responsable', 'nombres apellidos correo')
      .populate('inscritos', 'nombres apellidos documento_identidad')
      .lean();

    const reportData = await adminService.generateGeneralReport(programs);
    
    res.status(200).json({
      success: true,
      message: 'Reporte general generado exitosamente',
      data: reportData,
      filters: { startDate, endDate, estado, categoria },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generando reporte general:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar reporte general',
      error: error.message
    });
  }
};

/**
 * Generar reporte específico por programa
 */
const getProgramReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeProjects = true, includeParticipants = true } = req.query;

    const program = await Program.findById(id)
      .populate('responsable', 'nombres apellidos correo telefono')
      .populate('inscritos', 'nombres apellidos documento_identidad correo telefono ubicacion')
      .lean();

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    let projects = [];
    if (includeProjects === 'true') {
      projects = await Project.find({ programa_id: id })
        .populate('responsable_proyecto', 'nombres apellidos')
        .populate('participantes', 'nombres apellidos documento_identidad')
        .lean();
    }

    const reportData = await adminService.generateProgramReport(program, projects, {
      includeProjects: includeProjects === 'true',
      includeParticipants: includeParticipants === 'true'
    });

    res.status(200).json({
      success: true,
      message: 'Reporte del programa generado exitosamente',
      data: reportData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generando reporte del programa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar reporte del programa',
      error: error.message
    });
  }
};

/**
 * Generar reporte de participación por campesino
 */
const getParticipantsReport = async (req, res) => {
  try {
    const { documento_identidad, ubicacion, programa_id } = req.query;
    
    // Construir filtros para usuarios
    const userFilters = { tipo_usuario: 'campesino' };
    if (documento_identidad) userFilters.documento_identidad = documento_identidad;
    if (ubicacion) userFilters.ubicacion = new RegExp(ubicacion, 'i');

    const participants = await User.find(userFilters).lean();
    
    const reportData = await adminService.generateParticipantsReport(participants, programa_id);

    res.status(200).json({
      success: true,
      message: 'Reporte de participantes generado exitosamente',
      data: reportData,
      filters: { documento_identidad, ubicacion, programa_id },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generando reporte de participantes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar reporte de participantes',
      error: error.message
    });
  }
};

/**
 * Generar estadísticas generales del sistema
 */
const getSystemStatistics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // Período en días
    
    const statistics = await adminService.generateSystemStatistics(parseInt(period));

    res.status(200).json({
      success: true,
      message: 'Estadísticas del sistema generadas exitosamente',
      data: statistics,
      period: `${period} días`,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generando estadísticas del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar estadísticas',
      error: error.message
    });
  }
};

/**
 * Exportar reportes en diferentes formatos
 */
const exportReport = async (req, res) => {
  try {
    const { type } = req.params; // 'programs', 'participants', 'statistics'
    const { format = 'json' } = req.query; // 'json', 'csv', 'pdf'
    
    let data;
    let filename;
    
    switch (type) {
      case 'programs':
        const programs = await Program.find({})
          .populate('responsable', 'nombres apellidos')
          .lean();
        data = await adminService.generateGeneralReport(programs);
        filename = `reporte_programas_${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'participants':
        const participants = await User.find({ tipo_usuario: 'campesino' }).lean();
        data = await adminService.generateParticipantsReport(participants);
        filename = `reporte_participantes_${new Date().toISOString().split('T')[0]}`;
        break;
        
      case 'statistics':
        data = await adminService.generateSystemStatistics(30);
        filename = `estadisticas_sistema_${new Date().toISOString().split('T')[0]}`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte no válido. Use: programs, participants, statistics'
        });
    }

    if (format === 'csv') {
      const csvData = adminService.convertToCSV(data, type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvData);
    }

    if (format === 'pdf') {
      const pdfFilename = `reporte-${type}-${Date.now()}.pdf`;
      
      try {
        const pdfBuffer = await generatePDF(data, type, filename);
        
        // Verificar que el buffer sea válido
        if (!pdfBuffer || pdfBuffer.length === 0) {
          throw new Error('PDF buffer vacío o inválido');
        }
        
        console.log(`PDF generado exitosamente. Tamaño: ${pdfBuffer.length} bytes`);
        
        // Configurar headers para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${pdfFilename}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        // Enviar el PDF
        res.status(200);
        return res.send(pdfBuffer);
        
      } catch (pdfError) {
        console.error('Error específico generando PDF:', pdfError);
        return res.status(500).json({
          success: false,
          message: 'Error generando PDF',
          error: pdfError.message
        });
      }
    }

    // Formato JSON por defecto
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
    res.status(200).json({
      success: true,
      data,
      exportedAt: new Date(),
      format,
      type
    });
  } catch (error) {
    console.error('Error exportando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al exportar reporte',
      error: error.message
    });
  }
};

/**
 * Generar PDF usando Puppeteer
 */
const generatePDF = async (data, type, filename) => {
  console.log(`Iniciando generación de PDF para tipo: ${type}`);
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    console.log('Browser lanzado exitosamente');
    
    const page = await browser.newPage();
    const html = generateHTMLTemplate(data, type, filename);
    
    console.log('HTML template generado, longitud:', html.length);
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Contenido HTML cargado en la página');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    console.log(`PDF generado exitosamente, tamaño del buffer: ${pdfBuffer.length} bytes`);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error en generatePDF:', error);
    throw new Error(`Error generando PDF: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser cerrado');
    }
  }
};

/**
 * Generar template HTML para PDF
 */
const generateHTMLTemplate = (data, type, filename) => {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  let content = '';
  let title = '';
  
  switch (type) {
    case 'programs':
      title = 'Reporte de Programas Productivos';
      content = generateProgramsHTML(data);
      break;
    case 'participants':
      title = 'Reporte de Participantes';
      content = generateParticipantsHTML(data);
      break;
    case 'statistics':
      title = 'Estadísticas del Sistema';
      content = generateStatisticsHTML(data);
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        ${getPDFStyles()}
      </style>
    </head>
    <body>
      <header>
        <div class="header-content">
          <div class="logo">
            <h1>Alcaldía Municipal</h1>
            <p>Secretaría de Desarrollo Rural</p>
          </div>
          <div class="report-info">
            <h2>${title}</h2>
            <p>Fecha de generación: ${currentDate}</p>
          </div>
        </div>
      </header>
      
      <main>
        ${content}
      </main>
      
      <footer>
        <div class="footer-content">
          <p>© ${new Date().getFullYear()} Alcaldía Municipal - Todos los derechos reservados</p>
          <p>Este documento es confidencial y de uso exclusivo para funcionarios autorizados</p>
        </div>
      </footer>
    </body>
    </html>
  `;
};

/**
 * Generar HTML para reporte de programas
 */
const generateProgramsHTML = (data) => {
  if (!data.programs || data.programs.length === 0) {
    return '<div class="no-data">No hay programas disponibles para mostrar.</div>';
  }
  
  return `
    <section class="summary">
      <h3>Resumen Ejecutivo</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total de Programas</h4>
          <p class="stat-number">${data.totalPrograms || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Programas Activos</h4>
          <p class="stat-number">${data.activePrograms || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Total Participantes</h4>
          <p class="stat-number">${data.totalParticipants || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Presupuesto Total</h4>
          <p class="stat-number">$${(data.totalBudget || 0).toLocaleString('es-CO')}</p>
        </div>
      </div>
    </section>
    
    <section class="programs-list">
      <h3>Detalle de Programas</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Participantes</th>
            <th>Presupuesto</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          ${data.programs.map(program => `
            <tr>
              <td>${program.nombre || 'N/A'}</td>
              <td><span class="status ${program.estado}">${program.estado || 'N/A'}</span></td>
              <td>${program.inscritos?.length || 0}</td>
              <td>$${(program.presupuesto || 0).toLocaleString('es-CO')}</td>
              <td>${program.responsable?.nombres || 'N/A'} ${program.responsable?.apellidos || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
};

/**
 * Generar HTML para reporte de participantes
 */
const generateParticipantsHTML = (data) => {
  if (!data.participants || data.participants.length === 0) {
    return '<div class="no-data">No hay participantes disponibles para mostrar.</div>';
  }
  
  return `
    <section class="summary">
      <h3>Resumen de Participantes</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total Participantes</h4>
          <p class="stat-number">${data.totalParticipants || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Participantes Activos</h4>
          <p class="stat-number">${data.activeParticipants || 0}</p>
        </div>
      </div>
    </section>
    
    <section class="participants-list">
      <h3>Lista de Participantes</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Correo</th>
            <th>Ubicación</th>
            <th>Programas</th>
          </tr>
        </thead>
        <tbody>
          ${data.participants.map(participant => `
            <tr>
              <td>${participant.nombres || 'N/A'} ${participant.apellidos || ''}</td>
              <td>${participant.documento_identidad || 'N/A'}</td>
              <td>${participant.correo || 'N/A'}</td>
              <td>${participant.ubicacion || 'N/A'}</td>
              <td>${participant.programsCount || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
};

/**
 * Generar HTML para estadísticas
 */
const generateStatisticsHTML = (data) => {
  return `
    <section class="summary">
      <h3>Estadísticas Generales</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <h4>Total Programas</h4>
          <p class="stat-number">${data.totalPrograms || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Total Participantes</h4>
          <p class="stat-number">${data.totalUsers || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Proyectos Activos</h4>
          <p class="stat-number">${data.totalProjects || 0}</p>
        </div>
        <div class="stat-card">
          <h4>Tasa de Finalización</h4>
          <p class="stat-number">${data.completionRate || 0}%</p>
        </div>
      </div>
    </section>
    
    <section class="charts">
      <h3>Distribución por Estado</h3>
      <div class="chart-container">
        ${data.programsByStatus ? Object.entries(data.programsByStatus).map(([status, count]) => `
          <div class="chart-item">
            <span class="chart-label">${status}</span>
            <div class="chart-bar">
              <div class="chart-fill" style="width: ${(count / Math.max(...Object.values(data.programsByStatus))) * 100}%"></div>
            </div>
            <span class="chart-value">${count}</span>
          </div>
        `).join('') : '<p>No hay datos disponibles</p>'}
      </div>
    </section>
  `;
};

/**
 * Estilos CSS para PDF
 */
const getPDFStyles = () => {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
    }
    
    header {
      background: linear-gradient(135deg, #2c5530 0%, #4a7c59 100%);
      color: white;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .logo p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .report-info h2 {
      font-size: 20px;
      margin-bottom: 5px;
    }
    
    .report-info p {
      font-size: 12px;
      opacity: 0.9;
    }
    
    main {
      padding: 0 20px;
    }
    
    section {
      margin-bottom: 30px;
    }
    
    h3 {
      color: #2c5530;
      font-size: 18px;
      margin-bottom: 15px;
      border-bottom: 2px solid #4a7c59;
      padding-bottom: 5px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    
    .stat-card h4 {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 8px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #2c5530;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    .data-table th,
    .data-table td {
      border: 1px solid #dee2e6;
      padding: 8px 12px;
      text-align: left;
    }
    
    .data-table th {
      background-color: #4a7c59;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    
    .data-table td {
      font-size: 11px;
    }
    
    .data-table tr:nth-child(even) {
      background-color: #f8f9fa;
    }
    
    .status {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .status.activo {
      background-color: #d4edda;
      color: #155724;
    }
    
    .status.completado {
      background-color: #cce5ff;
      color: #004085;
    }
    
    .status.pendiente {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status.cancelado {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .chart-container {
      margin-top: 15px;
    }
    
    .chart-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .chart-label {
      width: 120px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .chart-bar {
      flex: 1;
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      margin: 0 10px;
      overflow: hidden;
    }
    
    .chart-fill {
      height: 100%;
      background: linear-gradient(90deg, #4a7c59, #2c5530);
      border-radius: 10px;
    }
    
    .chart-value {
      width: 40px;
      text-align: right;
      font-weight: bold;
      font-size: 12px;
    }
    
    .no-data {
      text-align: center;
      padding: 40px;
      color: #6c757d;
      font-style: italic;
    }
    
    footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
      padding: 10px 20px;
      font-size: 10px;
      color: #6c757d;
    }
    
    .footer-content {
      text-align: center;
    }
    
    .footer-content p {
      margin-bottom: 2px;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  `;
};

/**
 * Obtener métricas de rendimiento por programa
 */
const getProgramMetrics = async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await Program.findById(id).lean();
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Programa no encontrado'
      });
    }

    const projects = await Project.find({ programa_id: id }).lean();
    const metrics = await adminService.calculateProgramMetrics(program, projects);

    res.status(200).json({
      success: true,
      message: 'Métricas del programa calculadas exitosamente',
      data: metrics,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error calculando métricas del programa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al calcular métricas',
      error: error.message
    });
  }
};

/**
 * Obtener resumen ejecutivo
 */
const getExecutiveSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const summary = await adminService.generateExecutiveSummary({
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    });

    res.status(200).json({
      success: true,
      message: 'Resumen ejecutivo generado exitosamente',
      data: summary,
      period: { startDate, endDate },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error generando resumen ejecutivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar resumen ejecutivo',
      error: error.message
    });
  }
};

export {
  getGeneralReport,
  getProgramReport,
  getParticipantsReport,
  getSystemStatistics,
  exportReport,
  getProgramMetrics,
  getExecutiveSummary
};

export const getSystemHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'healthy' : dbState === 2 ? 'warning' : 'error';
    const uptimeSec = Math.round(process.uptime());
    const uploadsPath = path.join(process.cwd(), 'uploads');
    let fsStatus = 'healthy';
    try { fs.accessSync(uploadsPath, fs.constants.R_OK | fs.constants.W_OK); }
    catch { fsStatus = 'warning'; }

    const now = new Date();
    const components = [
      { component: 'Base de Datos', status: dbStatus, uptime: `${uptimeSec}s`, lastCheck: now.toISOString() },
      { component: 'Servidor Web', status: 'healthy', uptime: `${uptimeSec}s`, lastCheck: now.toISOString() },
      { component: 'Sistema de Archivos', status: fsStatus, uptime: `${uptimeSec}s`, lastCheck: now.toISOString() },
      { component: 'Notificaciones', status: 'warning', uptime: `${uptimeSec}s`, lastCheck: now.toISOString() }
    ];
    res.status(200).json({ success: true, data: components, generatedAt: now });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error obteniendo estado del sistema', error: error.message });
  }
}