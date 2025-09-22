import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface AuthContextType {
    user: any
    loading: boolean
    error: any
    registerCampesino: (credentials: {
        nombre: string;
        documento_identidad: string;
        correo: string;
        telefono: string;
        contrasena: string;
        vereda: string;
        direccion?: string;
    }) => Promise<any>
    registerFuncionario: (credentials: {
        nombre: string;
        documento_identidad: string;
        correo: string;
        telefono: string;
        contrasena: string;
        codigo_empleado: string;
        dependencia: string;
    }) => Promise<any>
    loginCampesino: (credentials: { correo?: string; documento_identidad?: string; contrasena: string }) => Promise<any>
    loginFuncionario: (credentials: { correo?: string; documento_identidad?: string; contrasena: string }) => Promise<any>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth()

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuthContext() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext debe ser usado dentro de un AuthProvider')
    }
    return context
}