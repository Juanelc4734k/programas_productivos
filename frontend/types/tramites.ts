export type TramiteEstado = 'submitted' | 'in_review' | 'approved' | 'rejected' | 'completed'
export type TramitePrioridad = 'high' | 'medium' | 'low'

export interface TramiteDocumento {
  nombre: string
  cloudinaryId?: string
  cloudinaryUrl?: string
  tipo?: string
  subido_en?: string
  subido_por?: string
}

export interface TramiteItem {
  _id: string
  usuario: string
  tipo_tramite: 'supplies_request' | 'technical_request' | 'program_enrollment' | 'certificate_request'
  titulo: string
  descripcion: string
  tipo_insumo?: string
  cantidad?: number
  estado: TramiteEstado
  fecha_solicitud: string
  fecha_revision?: string
  fecha_completado?: string
  revisado_por?: string
  notas?: string
  documentos?: TramiteDocumento[]
  vereda: string
  prioridad: TramitePrioridad
  createdAt?: string
  updatedAt?: string
}