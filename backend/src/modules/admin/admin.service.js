import Program from '../programs/programs.model.js';
import Project from '../programs/projects.model.js';
import User from '../auth/user.model.js';

/**
 * Generar reporte general de todos los programas
 */
const generateGeneralReport = async (programs) => {
  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.estado === 'activo').length;
  const completedPrograms = programs.filter(p => p.estado === 'completado').length;
  const pendingPrograms = programs.filter(p => p.estado === 'pendiente').length;
  
  const totalParticipants = programs.reduce((sum, p) => sum + (p.inscritos?.length || 0), 0);
  const totalBudget = programs.reduce((sum, p) => sum + (p.presupuesto || 0), 0);
  
  // Agrupar por categoría
  const byCategory = programs.reduce((acc, program) => {
    const category = program.categoria || 'Sin categoría';
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        participants: 0,
        budget: 0,
        active: 0,
        completed: 0
      };
    }
    acc[category].count++;
    acc[category].participants += program.inscritos?.length || 0;
    acc[category].budget += program.presupuesto || 0;
    if (program.estado === 'activo') acc[category].active++;
    if (program.estado === 'completado') acc[category].completed++;
    return acc;
  }, {});
  
  // Programas con mayor participación
  const topPrograms = programs
    .sort((a, b) => (b.inscritos?.length || 0) - (a.inscritos?.length || 0))
    .slice(0, 5)
    .map(p => ({
      id: p._id,
      nombre: p.nombre,
      participantes: p.inscritos?.length || 0,
      estado: p.estado,
      categoria: p.categoria,
      progreso: p.progreso || 0
    }));
  
  return {
    resumen: {
      totalPrograms,
      activePrograms,
      completedPrograms,
      pendingPrograms,
      totalParticipants,
      totalBudget,
      averageParticipants: totalPrograms > 0 ? Math.round(totalParticipants / totalPrograms) : 0
    },
    porCategoria: byCategory,
    programasDestacados: topPrograms,
    programas: programs.map(p => ({
      id: p._id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      estado: p.estado,
      fechaInicio: p.fecha_inicio,
      fechaFin: p.fecha_fin,
      participantes: p.inscritos?.length || 0,
      cupos: p.cupos,
      progreso: p.progreso || 0,
      presupuesto: p.presupuesto || 0,
      responsable: p.responsable ? {
        nombre: `${p.responsable.nombres} ${p.responsable.apellidos}`,
        correo: p.responsable.correo
      } : null
    }))
  };
};

/**
 * Generar reporte específico por programa
 */
const generateProgramReport = async (program, projects = [], options = {}) => {
  const { includeProjects = true, includeParticipants = true } = options;
  
  const reportData = {
    programa: {
      id: program._id,
      nombre: program.nombre,
      descripcion: program.descripcion,
      categoria: program.categoria,
      estado: program.estado,
      fechaInicio: program.fecha_inicio,
      fechaFin: program.fecha_fin,
      cupos: program.cupos,
      participantesInscritos: program.inscritos?.length || 0,
      progreso: program.progreso || 0,
      presupuesto: program.presupuesto || 0,
      ubicaciones: program.ubicaciones || [],
      beneficios: program.beneficios || [],
      requisitos: program.requisitos || [],
      responsable: program.responsable ? {
        nombre: `${program.responsable.nombres} ${program.responsable.apellidos}`,
        correo: program.responsable.correo,
        telefono: program.responsable.telefono
      } : null
    },
    metricas: {
      ocupacion: program.cupos > 0 ? Math.round(((program.inscritos?.length || 0) / program.cupos) * 100) : 0,
      progreso: program.progreso || 0,
      diasTranscurridos: program.fecha_inicio ? Math.floor((new Date() - new Date(program.fecha_inicio)) / (1000 * 60 * 60 * 24)) : 0,
      diasRestantes: program.fecha_fin ? Math.floor((new Date(program.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    }
  };
  
  if (includeParticipants && program.inscritos) {
    reportData.participantes = program.inscritos.map(p => ({
      id: p._id,
      nombre: `${p.nombres} ${p.apellidos}`,
      documento: p.documento_identidad,
      correo: p.correo,
      telefono: p.telefono,
      ubicacion: p.ubicacion
    }));
  }
  
  if (includeProjects && projects.length > 0) {
    const activeProjects = projects.filter(p => p.estado === 'activo').length;
    const completedProjects = projects.filter(p => p.estado === 'completado').length;
    const totalBudgetProjects = projects.reduce((sum, p) => sum + (p.presupuesto_real || p.presupuesto_estimado || 0), 0);
    
    reportData.proyectos = {
      resumen: {
        total: projects.length,
        activos: activeProjects,
        completados: completedProjects,
        presupuestoTotal: totalBudgetProjects
      },
      lista: projects.map(p => ({
        id: p._id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        estado: p.estado,
        fechaInicioEstimada: p.fecha_inicio_estimada,
        fechaFinEstimada: p.fecha_fin_estimada,
        fechaInicioReal: p.fecha_inicio_real,
        fechaFinReal: p.fecha_fin_real,
        presupuestoEstimado: p.presupuesto_estimado,
        presupuestoReal: p.presupuesto_real,
        participantes: p.participantes?.length || 0,
        responsable: p.responsable_proyecto ? {
          nombre: `${p.responsable_proyecto.nombres} ${p.responsable_proyecto.apellidos}`
        } : null,
        ubicacion: p.ubicacion
      }))
    };
  }
  
  return reportData;
};

/**
 * Generar reporte de participación por campesino
 */
const generateParticipantsReport = async (participants, programaId = null) => {
  const reportData = {
    resumen: {
      totalParticipantes: participants.length,
      participantesActivos: 0,
      programasPromedio: 0
    },
    participantes: []
  };
  
  for (const participant of participants) {
    // Buscar programas en los que participa
    const programFilters = { inscritos: participant._id };
    if (programaId) programFilters._id = programaId;
    
    const programs = await Program.find(programFilters)
      .select('nombre categoria estado fecha_inicio fecha_fin progreso')
      .lean();
    
    // Buscar proyectos en los que participa
    const projects = await Project.find({ participantes: participant._id })
      .select('nombre estado programa_id fecha_inicio_real fecha_fin_real')
      .lean();
    
    const participantData = {
      id: participant._id,
      nombre: participant.nombre || `${participant.nombres || ''} ${participant.apellidos || ''}`.trim(),
      documento: participant.documento_identidad || participant.documento || '',
      correo: participant.correo || '',
      telefono: participant.telefono || '',
      ubicacion: participant.vereda || participant.ubicacion || 'Sin especificar',
      fechaRegistro: participant.createdAt,
      programas: {
        total: programs.length,
        activos: programs.filter(p => p.estado === 'activo').length,
        completados: programs.filter(p => p.estado === 'completado').length,
        lista: programs.map(p => ({
          id: p._id,
          nombre: p.nombre,
          categoria: p.categoria,
          estado: p.estado,
          progreso: p.progreso || 0
        }))
      },
      proyectos: {
        total: projects.length,
        activos: projects.filter(p => p.estado === 'activo').length,
        completados: projects.filter(p => p.estado === 'completado').length,
        lista: projects.map(p => ({
          id: p._id,
          nombre: p.nombre,
          estado: p.estado,
          programaId: p.programa_id
        }))
      }
    };
    
    if (programs.length > 0 || projects.length > 0) {
      reportData.resumen.participantesActivos++;
    }
    
    reportData.participantes.push(participantData);
  }
  
  reportData.resumen.programasPromedio = reportData.participantes.length > 0 
    ? Math.round(reportData.participantes.reduce((sum, p) => sum + p.programas.total, 0) / reportData.participantes.length)
    : 0;
  
  return reportData;
};

/**
 * Generar estadísticas generales del sistema
 */
const generateSystemStatistics = async (periodDays = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);
  
  // Estadísticas de programas
  const totalPrograms = await Program.countDocuments();
  const activePrograms = await Program.countDocuments({ estado: 'activo' });
  const recentPrograms = await Program.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // Estadísticas de usuarios
  const totalUsers = await User.countDocuments();
  const campesinos = await User.countDocuments({ tipo_usuario: 'campesino' });
  const funcionarios = await User.countDocuments({ tipo_usuario: 'funcionario' });
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate }
  });
  
  // Estadísticas de proyectos
  const totalProjects = await Project.countDocuments();
  const activeProjects = await Project.countDocuments({ estado: 'activo' });
  const completedProjects = await Project.countDocuments({ estado: 'completado' });
  
  // Participación por ubicación
  const participationByLocation = await User.aggregate([
    { $match: { tipo_usuario: 'campesino' } },
    { $group: { _id: '$ubicacion', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  
  // Programas por categoría
  const programsByCategory = await Program.aggregate([
    { $group: { _id: '$categoria', count: { $sum: 1 }, participants: { $sum: { $size: '$inscritos' } } } },
    { $sort: { count: -1 } }
  ]);
  
  // Tendencias mensuales (últimos 6 meses)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyTrends = await Program.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        programas: { $sum: 1 },
        participantes: { $sum: { $size: '$inscritos' } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  return {
    periodo: {
      inicio: startDate,
      fin: endDate,
      dias: periodDays
    },
    programas: {
      total: totalPrograms,
      activos: activePrograms,
      nuevosEnPeriodo: recentPrograms,
      porcentajeActivos: totalPrograms > 0 ? Math.round((activePrograms / totalPrograms) * 100) : 0
    },
    usuarios: {
      total: totalUsers,
      campesinos,
      funcionarios,
      nuevosEnPeriodo: recentUsers,
      distribucion: {
        campesinos: totalUsers > 0 ? Math.round((campesinos / totalUsers) * 100) : 0,
        funcionarios: totalUsers > 0 ? Math.round((funcionarios / totalUsers) * 100) : 0
      }
    },
    proyectos: {
      total: totalProjects,
      activos: activeProjects,
      completados: completedProjects,
      tasaCompletacion: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
    },
    participacionPorUbicacion: participationByLocation.map(item => ({
      ubicacion: item._id || 'Sin especificar',
      participantes: item.count
    })),
    programasPorCategoria: programsByCategory.map(item => ({
      categoria: item._id || 'Sin categoría',
      programas: item.count,
      participantes: item.participants
    })),
    tendenciasMensuales: monthlyTrends.map(item => ({
      año: item._id.year,
      mes: item._id.month,
      programas: item.programas,
      participantes: item.participantes
    }))
  };
};

/**
 * Calcular métricas de rendimiento por programa
 */
const calculateProgramMetrics = async (program, projects = []) => {
  const metrics = {
    programa: {
      id: program._id,
      nombre: program.nombre,
      estado: program.estado
    },
    participacion: {
      cupos: program.cupos || 0,
      inscritos: program.inscritos?.length || 0,
      porcentajeOcupacion: program.cupos > 0 ? Math.round(((program.inscritos?.length || 0) / program.cupos) * 100) : 0
    },
    progreso: {
      actual: program.progreso || 0,
      diasTranscurridos: 0,
      diasTotales: 0,
      porcentajeTiempo: 0
    },
    presupuesto: {
      asignado: program.presupuesto || 0,
      ejecutado: 0,
      porcentajeEjecucion: 0
    },
    proyectos: {
      total: projects.length,
      activos: projects.filter(p => p.estado === 'activo').length,
      completados: projects.filter(p => p.estado === 'completado').length,
      enProceso: projects.filter(p => p.estado === 'en_proceso').length
    }
  };
  
  // Calcular métricas de tiempo
  if (program.fecha_inicio && program.fecha_fin) {
    const inicio = new Date(program.fecha_inicio);
    const fin = new Date(program.fecha_fin);
    const ahora = new Date();
    
    metrics.progreso.diasTotales = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
    metrics.progreso.diasTranscurridos = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
    
    if (metrics.progreso.diasTotales > 0) {
      metrics.progreso.porcentajeTiempo = Math.min(100, Math.round((metrics.progreso.diasTranscurridos / metrics.progreso.diasTotales) * 100));
    }
  }
  
  // Calcular presupuesto ejecutado de proyectos
  if (projects.length > 0) {
    metrics.presupuesto.ejecutado = projects.reduce((sum, p) => sum + (p.presupuesto_real || 0), 0);
    if (metrics.presupuesto.asignado > 0) {
      metrics.presupuesto.porcentajeEjecucion = Math.round((metrics.presupuesto.ejecutado / metrics.presupuesto.asignado) * 100);
    }
  }
  
  return metrics;
};

/**
 * Generar resumen ejecutivo
 */
const generateExecutiveSummary = async (options = {}) => {
  const { startDate, endDate } = options;
  
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = startDate;
    if (endDate) dateFilter.createdAt.$lte = endDate;
  }
  
  const [programStats, userStats, projectStats] = await Promise.all([
    Program.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
          completados: { $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] } },
          totalParticipantes: { $sum: { $size: '$inscritos' } },
          presupuestoTotal: { $sum: '$presupuesto' }
        }
      }
    ]),
    User.aggregate([
      { $match: { ...dateFilter, tipo_usuario: 'campesino' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 }
        }
      }
    ]),
    Project.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          activos: { $sum: { $cond: [{ $eq: ['$estado', 'activo'] }, 1, 0] } },
          completados: { $sum: { $cond: [{ $eq: ['$estado', 'completado'] }, 1, 0] } }
        }
      }
    ])
  ]);
  
  const programData = programStats[0] || {};
  const userData = userStats[0] || {};
  const projectData = projectStats[0] || {};
  
  return {
    periodo: {
      inicio: startDate,
      fin: endDate
    },
    indicadoresClave: {
      programasActivos: programData.activos || 0,
      totalParticipantes: programData.totalParticipantes || 0,
      proyectosEnEjecucion: projectData.activos || 0,
      presupuestoTotal: programData.presupuestoTotal || 0
    },
    rendimiento: {
      tasaCompletacionProgramas: programData.total > 0 ? Math.round((programData.completados / programData.total) * 100) : 0,
      tasaCompletacionProyectos: projectData.total > 0 ? Math.round((projectData.completados / projectData.total) * 100) : 0,
      participacionPromedio: programData.total > 0 ? Math.round(programData.totalParticipantes / programData.total) : 0
    },
    crecimiento: {
      nuevosCampesinos: userData.total || 0,
      nuevosProyectos: projectData.total || 0,
      nuevosPrograms: programData.total || 0
    }
  };
};

/**
 * Convertir datos a formato CSV
 */
const convertToCSV = (data, type) => {
  let csvContent = '';
  
  switch (type) {
    case 'programs':
      csvContent = 'ID,Nombre,Categoría,Estado,Participantes,Cupos,Progreso,Presupuesto,Fecha Inicio,Fecha Fin\n';
      if (data.programas) {
        data.programas.forEach(program => {
          csvContent += `"${program.id}","${program.nombre}","${program.categoria || ''}","${program.estado}",${program.participantes},${program.cupos},${program.progreso},${program.presupuesto},"${program.fechaInicio || ''}","${program.fechaFin || ''}"\n`;
        });
      }
      break;
      
    case 'participants':
      csvContent = 'ID,Nombre,Documento,Correo,Teléfono,Ubicación,Programas Activos,Proyectos Activos\n';
      if (data.participantes) {
        data.participantes.forEach(participant => {
          csvContent += `"${participant.id}","${participant.nombre}","${participant.documento}","${participant.correo || ''}","${participant.telefono || ''}","${participant.ubicacion || ''}",${participant.programas.activos},${participant.proyectos.activos}\n`;
        });
      }
      break;
      
    case 'statistics':
      csvContent = 'Métrica,Valor\n';
      csvContent += `"Total Programas",${data.programas?.total || 0}\n`;
      csvContent += `"Programas Activos",${data.programas?.activos || 0}\n`;
      csvContent += `"Total Usuarios",${data.usuarios?.total || 0}\n`;
      csvContent += `"Total Campesinos",${data.usuarios?.campesinos || 0}\n`;
      csvContent += `"Total Proyectos",${data.proyectos?.total || 0}\n`;
      break;
      
    default:
      csvContent = 'Error: Tipo de reporte no soportado para CSV\n';
  }
  
  return csvContent;
};

export {
  generateGeneralReport,
  generateProgramReport,
  generateParticipantsReport,
  generateSystemStatistics,
  calculateProgramMetrics,
  generateExecutiveSummary,
  convertToCSV
};