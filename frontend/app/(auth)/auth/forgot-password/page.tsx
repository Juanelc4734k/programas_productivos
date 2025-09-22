"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, User, Shield, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "react-toastify"
import { passwordResetService } from "@/services/password-reset.service"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"request" | "sent" | "reset">("request")
  const [userType, setUserType] = useState<"campesino" | "funcionario">("campesino")
  const [email, setEmail] = useState("")
  const [originalEmail, setOriginalEmail] = useState("") // Nuevo estado para el email original
  const [resetId, setResetId] = useState("")

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const identifier = formData.get('identifier') as string
      
      const response = await passwordResetService.requestReset({
        identifier,
        userType
      })
      
      // Guardar el email original (identifier si es email, o extraer del response)
      const originalEmailValue = identifier.includes('@') ? identifier : response.originalEmail || identifier
      setOriginalEmail(originalEmailValue)
      
      setEmail(response.email || identifier) // Email oculto para mostrar
      setStep("sent")
      toast.success(response.message)
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el código")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const code = formData.get('code') as string
      
      const response = await passwordResetService.verifyCode({
        email: originalEmail, // Usar el email original en lugar del oculto
        code
      })
      
      setResetId(response.resetId)
      setStep("reset")
      toast.success(response.message)
    } catch (error: any) {
      toast.error(error.message || "Código inválido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const newPassword = formData.get('newPassword') as string
      const confirmPassword = formData.get('confirmPassword') as string
      
      const response = await passwordResetService.resetPassword({
        resetId,
        newPassword,
        confirmPassword
      })
      
      toast.success(response.message)
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar la contraseña")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Plataforma Montebello</h1>
          <p className="text-gray-600">Recuperar Contraseña</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2 mb-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al login
                </Button>
              </Link>
            </div>
            <CardTitle>
              {step === "request" && "Recuperar Contraseña"}
              {step === "sent" && "Código Enviado"}
              {step === "reset" && "Nueva Contraseña"}
            </CardTitle>
            <CardDescription>
              {step === "request" && "Te ayudaremos a recuperar el acceso a tu cuenta"}
              {step === "sent" && "Revisa tu correo para el código de verificación"}
              {step === "reset" && "Crea una nueva contraseña segura"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "request" && (
              <>
                <Tabs
                  defaultValue="campesino"
                  className="space-y-4"
                  onValueChange={(value) => setUserType(value as "campesino" | "funcionario")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="campesino" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Campesino</span>
                    </TabsTrigger>
                    <TabsTrigger value="funcionario" className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>Funcionario</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="campesino">
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ingresa tu correo electrónico o número de cédula para recuperar tu contraseña.
                        </AlertDescription>
                      </Alert>

                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="farmer-identifier">Correo electrónico o Cédula</Label>
                          <Input 
                            id="farmer-identifier" 
                            name="identifier"
                            type="text" 
                            placeholder="juan@correo.com o 12345678" 
                            required 
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                          disabled={isLoading}
                        >
                          {isLoading ? "Enviando..." : "Enviar código por correo"}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>

                  <TabsContent value="funcionario">
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Ingresa tu correo institucional para recuperar tu contraseña.
                        </AlertDescription>
                      </Alert>

                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin-email">Correo institucional</Label>
                          <Input 
                            id="admin-email" 
                            name="identifier"
                            type="email" 
                            placeholder="funcionario@montebello.gov.co" 
                            required 
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          disabled={isLoading}
                        >
                          {isLoading ? "Enviando..." : "Enviar código por correo"}
                        </Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}

            {step === "sent" && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Hemos enviado un código de verificación a tu correo electrónico. El código expira en 15 minutos.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Código de verificación</Label>
                    <Input
                      id="verification-code"
                      name="code"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Verificando..." : "Verificar código"}
                  </Button>

                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-sm" 
                      onClick={() => setStep("request")}
                    >
                      ¿No recibiste el código? Enviar de nuevo
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === "reset" && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Código verificado correctamente. Ahora puedes crear una nueva contraseña.
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleNewPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input 
                      id="new-password" 
                      name="newPassword"
                      type="password" 
                      placeholder="Mínimo 8 caracteres" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirm-new-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">Tu contraseña debe tener:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Al menos 8 caracteres</li>
                      <li>• Una letra mayúscula</li>
                      <li>• Una letra minúscula</li>
                      <li>• Un número</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Actualizando..." : "Cambiar contraseña"}
                  </Button>
                </form>
              </div>
            )}

            {step === "request" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Recordaste tu contraseña?{" "}
                  <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>¿Problemas para recuperar tu cuenta? Contacta al: (123) 456-7890</p>
        </div>
      </div>
    </div>
  )
}
