import express from 'express';
import * as adminController from './admin.controller.js';
import * as adminMiddleware from './admin.middleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas de admin
router.use(adminMiddleware.verifyFuncionarioAccess);

/**
 * @route GET /api/admin/reports/programs
 * @desc Obtener reporte general de todos los programas
 * @access Funcionario/Admin
 * @query {string} startDate - Fecha de inicio (opcional)
 * @query {string} endDate - Fecha de fin (opcional)
 * @query {string} estado - Estado del programa (opcional)
 * @query {string} categoria - Categoría del programa (opcional)
 */
router.get('/reports/programs', 
  adminMiddleware.validateReportParams,
  adminController.getGeneralReport
);

/**
 * @route GET /api/admin/reports/programs/:id
 * @desc Obtener reporte específico de un programa
 * @access Funcionario/Admin
 * @param {string} id - ID del programa
 * @query {boolean} includeProjects - Incluir proyectos asociados (default: true)
 * @query {boolean} includeParticipants - Incluir participantes (default: true)
 */
router.get('/reports/programs/:id',
  adminMiddleware.validateProgramId,
  adminController.getProgramReport
);

/**
 * @route GET /api/admin/reports/participants
 * @desc Obtener reporte de participación por campesino
 * @access Funcionario/Admin
 * @query {string} documento_identidad - Documento de identidad específico (opcional)
 * @query {string} ubicacion - Ubicación del participante (opcional)
 * @query {string} programa_id - ID del programa específico (opcional)
 */
router.get('/reports/participants',
  adminMiddleware.validateParticipantsParams,
  adminController.getParticipantsReport
);

/**
 * @route GET /api/admin/reports/statistics
 * @desc Obtener estadísticas generales del sistema
 * @access Funcionario/Admin
 * @query {number} period - Período en días para las estadísticas (default: 30)
 */
router.get('/reports/statistics',
  adminMiddleware.validateStatisticsParams,
  adminController.getSystemStatistics
);

/**
 * @route GET /api/admin/reports/export/:type
 * @desc Exportar reportes en diferentes formatos
 * @access Funcionario/Admin
 * @param {string} type - Tipo de reporte (programs, participants, statistics)
 * @query {string} format - Formato de exportación (json, csv, pdf) (default: json)
 */
router.get('/reports/export/:type',
  adminMiddleware.validateExportParams,
  adminController.exportReport
);

/**
 * @route GET /api/admin/metrics/programs/:id
 * @desc Obtener métricas de rendimiento por programa
 * @access Funcionario/Admin
 * @param {string} id - ID del programa
 */
router.get('/metrics/programs/:id',
  adminMiddleware.validateProgramId,
  adminController.getProgramMetrics
);

/**
 * @route GET /api/admin/reports/executive-summary
 * @desc Obtener resumen ejecutivo
 * @access Funcionario/Admin
 * @query {string} startDate - Fecha de inicio (opcional)
 * @query {string} endDate - Fecha de fin (opcional)
 */
router.get('/reports/executive-summary',
  adminMiddleware.validateDateRange,
  adminController.getExecutiveSummary
);

/**
 * @route GET /api/admin/health
 * @desc Verificar estado del módulo de administración
 * @access Funcionario/Admin
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Módulo de administración funcionando correctamente',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

router.get('/system/health', adminController.getSystemHealth);

/**
 * Rutas adicionales para análisis específicos
 */

/**
 * @route GET /api/admin/analytics/programs-by-category
 * @desc Obtener análisis de programas por categoría
 * @access Funcionario/Admin
 */
router.get('/analytics/programs-by-category', async (req, res) => {
  try {
    const { default: Program } = await import('../programs/programs.model.js');
    
    const analytics = await Program.aggregate([
      {
        $group: {
          _id: '$categoria',
          count: { $sum: 1 },
          totalParticipants: { $sum: { $size: '$inscritos' } },
          avgProgress: { $avg: '$progreso' },
          totalBudget: { $sum: '$presupuesto' },
          activePrograms: {
            $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          categoria: '$_id',
          programas: '$count',
          participantes: '$totalParticipants',
          progresoPromedio: { $round: ['$avgProgress', 2] },
          presupuestoTotal: '$totalBudget',
          programasActivos: '$activePrograms',
          _id: 0
        }
      },
      { $sort: { programas: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Análisis por categoría generado exitosamente',
      data: analytics,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error en análisis por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/admin/analytics/participation-trends
 * @desc Obtener tendencias de participación
 * @access Funcionario/Admin
 * @query {number} months - Número de meses hacia atrás (default: 6)
 */
router.get('/analytics/participation-trends', async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const Program = import('../programs/programs.model');
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    const trends = await Program.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          programasCreados: { $sum: 1 },
          totalParticipantes: { $sum: { $size: '$inscritos' } },
          progresoPromedio: { $avg: '$progreso' }
        }
      },
      {
        $project: {
          año: '$_id.year',
          mes: '$_id.month',
          programas: '$programasCreados',
          participantes: '$totalParticipantes',
          progreso: { $round: ['$progresoPromedio', 2] },
          _id: 0
        }
      },
      { $sort: { año: 1, mes: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Tendencias de participación generadas exitosamente',
      data: trends,
      period: `${months} meses`,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error en tendencias de participación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * @route GET /api/admin/analytics/budget-analysis
 * @desc Obtener análisis de presupuestos
 * @access Funcionario/Admin
 */
router.get('/analytics/budget-analysis', async (req, res) => {
  try {
    const { default: Program } = await import('../programs/programs.model.js');
    const { default: Project } = await import('../programs/projects.model.js');
    
    const [programBudgets, projectBudgets] = await Promise.all([
      Program.aggregate([
        {
          $group: {
            _id: '$categoria',
            totalAsignado: { $sum: '$presupuesto' },
            programas: { $sum: 1 },
            promedioPresupuesto: { $avg: '$presupuesto' }
          }
        },
        {
          $project: {
            categoria: '$_id',
            presupuestoTotal: '$totalAsignado',
            numeroProgramas: '$programas',
            presupuestoPromedio: { $round: ['$promedioPresupuesto', 2] },
            _id: 0
          }
        }
      ]),
      Project.aggregate([
        {
          $group: {
            _id: null,
            totalEstimado: { $sum: '$presupuesto_estimado' },
            totalReal: { $sum: '$presupuesto_real' },
            proyectos: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const projectData = projectBudgets[0] || {};
    const eficienciaPresupuestal = projectData.totalEstimado > 0 
      ? Math.round((projectData.totalReal / projectData.totalEstimado) * 100)
      : 0;
    
    res.status(200).json({
      success: true,
      message: 'Análisis de presupuestos generado exitosamente',
      data: {
        programas: programBudgets,
        proyectos: {
          presupuestoEstimadoTotal: projectData.totalEstimado || 0,
          presupuestoRealTotal: projectData.totalReal || 0,
          eficienciaPresupuestal: eficienciaPresupuestal,
          totalProyectos: projectData.proyectos || 0
        }
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Error en análisis de presupuestos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export default router;