// Tipos TypeScript para programas

export interface Testimonio {
  _id?: string;
  texto: string;
  autor: string;
  fecha: string;
}

export interface User {
  _id: string;
  nombre: string;
  email: string;
  telefono?: string;
  tipo_usuario: 'campesino' | 'funcionario' | 'admin';
}

export interface Program {
  _id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activo' | 'finalizado' | 'en espera' | 'cancelado';
  cupos: number;
  banner_url?: string;
  responsable?: User;
  inscritos: User[];
  beneficios: string[];
  requisitos: string[];
  progreso: number;
  presupuesto: number;
  ubicaciones: string[];
  testimonios: Testimonio[];
  createdAt: string;
  updatedAt: string;
}

export interface ProgramResponse {
  success: boolean;
  data: Program;
  message?: string;
}

export interface ProgramsListResponse {
  success: boolean;
  data: Program[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// Tipos para el estado de carga
export interface ProgramState {
  program: Program | null;
  loading: boolean;
  error: string | null;
}

// Tipos para filtros y búsqueda
export interface ProgramFilters {
  categoria?: string;
  estado?: string;
  search?: string;
}