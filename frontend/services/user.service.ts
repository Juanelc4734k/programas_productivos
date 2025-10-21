import api from "@/lib/api"
import type { User as ProgramUser } from "@/types/programs"

export async function getUserById(id: string): Promise<ProgramUser> {
  const { data } = await api.get(`/users/${id}`)
  return {
    _id: data._id,
    nombre: data.nombre,
    email: data.correo ?? data.email,
    telefono: data.telefono,
    tipo_usuario: data.tipo_usuario,
  }
}