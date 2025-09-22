// Tipos TypeScript para beneficiarios

export interface Beneficiary {
  _id: string;
  nombre: string;
  documento_identidad: string;
  correo: string;
  telefono: string;
  tipo_usuario: 'campesino' | 'funcionario' | 'admin';
  estado: 'activo' | 'inactivo';
  fecha_registro: string;
  vereda?: string;
  direccion?: string;
  codigo_empleado?: string;
  dependencia?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeneficiaryWithPrograms extends Beneficiary {
  programas: ProgramInfo[];
  totalProgramas: number;
}

export interface ProgramInfo {
  _id: string;
  nombre: string;
  estado: string;
  fecha_inscripcion: string;
}

export interface BeneficiariesResponse {
  success: boolean;
  message: string;
  data: {
    beneficiaries: BeneficiaryWithPrograms[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BeneficiariesFilters {
  search?: string;
  estado?: 'activo' | 'inactivo' | 'todos';
  vereda?: string;
  programa?: string;
  page?: number;
  limit?: number;
}

export interface BeneficiaryStats {
  total: number;
  activos: number;
  inactivos: number;
  porVereda: Record<string, number>;
  porPrograma: Record<string, number>;
}