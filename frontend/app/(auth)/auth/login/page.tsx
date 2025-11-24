"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, User, Shield } from "lucide-react"
import { useAuthContext } from "@/contexts/auth-context"
import { toast } from 'react-toastify'

export default function LoginPage() {
  const { loginCampesino, loginFuncionario } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('farmer')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const identifier = formData.get('identifier') as string
      const contrasena = formData.get('contrasena') as string

      if (!identifier || !contrasena) {
        throw new Error('Debe proporcionar correo o documento de identidad, y contraseña')
      }

      const credentials = {
        ...(identifier.includes('@')
          ? { correo: identifier }
          : { documento_identidad: identifier }),
        contrasena
      }

      if (activeTab === 'farmer') {
        await loginCampesino(credentials)
        toast.success('Inicio de sesión exitoso. Bienvenido!')
        setTimeout(() => { window.location.href = '/user' }, 1500)
      } else {
        await loginFuncionario(credentials)
        toast.success('Acceso autorizado. Bienvenido!')
        // Determinar destino según rol en token
        const token = localStorage.getItem('token')
        let destino = '/funcionario'
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            destino = payload?.tipo_usuario === 'admin' ? '/admin' : '/funcionario'
          } catch {}
        }
        setTimeout(() => { window.location.href = destino }, 1500)
      }
    } catch (error: any) {
      console.error('Error de login:', error)
      
      // Mostrar el mensaje de error específico del servidor
      const errorMessage = error.message || 'Error al iniciar sesión. Por favor, verifica tus credenciales.'
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Plataforma Montebello</h1>
          <p className="text-gray-600">Programas Productivos Rurales</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Accede a tu cuenta para gestionar programas y trámites</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="farmer"
              className="space-y-4"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="farmer" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Campesino</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Funcionario</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="farmer">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Correo electrónico o Documento de identidad</Label>
                    <Input
                      name="identifier"
                      id="identifier"
                      type="text"
                      placeholder="ejemplo@correo.com o 12345678"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contrasena">Contraseña</Label>
                    <Input
                      name="contrasena"
                      id="contrasena"
                      type="password"
                      placeholder="Tu contraseña"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">Correo institucional</Label>
                    <Input
                      name="identifier"
                      id="identifier"
                      type="email"
                      placeholder="funcionario@montebello.gov.co"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contrasena">Contraseña</Label>
                    <Input
                      name="contrasena"
                      id="contrasena"
                      type="password"
                      placeholder="Contraseña institucional"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando sesión..." : "Acceder al Panel"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-2">
              <Button 
                variant="link" 
                className="w-full text-sm"
                onClick={() => window.location.href = '/auth/forgot-password'}>
                ¿Olvidaste tu contraseña?
              </Button>
              <Button
                variant="link"
                className="w-full text-sm"
                onClick={() => window.location.href = '/auth/register'}
              >
                ¿No tienes cuenta? Regístrate aquí
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>¿Necesitas ayuda? Contacta al: (123) 456-7890</p>
        </div>
      </div>
    </div>
  )
}
