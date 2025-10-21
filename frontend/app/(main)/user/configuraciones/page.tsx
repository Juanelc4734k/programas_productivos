'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'

export default function ConfiguracionesPage() {
  const { toast } = useToast()

  // Estado base de configuraciones
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifInApp, setNotifInApp] = useState(true)
  const [notifSMS, setNotifSMS] = useState(false)
  const [notifRecordatorios, setNotifRecordatorios] = useState(true)

  const [privPerfilPublico, setPrivPerfilPublico] = useState(false)
  const [privCompartirProgreso, setPrivCompartirProgreso] = useState(true)

  const [tema, setTema] = useState<'system' | 'light' | 'dark'>('system')
  const [idioma, setIdioma] = useState<'es' | 'en'>('es')

  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')

  const handleGuardar = () => {
    // Aquí se podría enviar al backend las configuraciones
    toast({
      title: 'Configuraciones guardadas',
      description: 'Tus preferencias han sido actualizadas.',
    })
  }

  const handleCancelar = () => {
    toast({
      title: 'Cambios descartados',
      description: 'No se han aplicado modificaciones.',
    })
    window.location.href = '/user'
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Configuraciones</h1>
      <p className="text-sm text-gray-600">Gestiona tus preferencias de cuenta, notificaciones y apariencia.</p>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Preferencias de notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-email">Notificaciones por correo</Label>
              <Switch id="notif-email" checked={notifEmail} onCheckedChange={setNotifEmail} aria-label="Notificaciones por correo" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-inapp">Notificaciones en la aplicación</Label>
              <Switch id="notif-inapp" checked={notifInApp} onCheckedChange={setNotifInApp} aria-label="Notificaciones en la aplicación" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-sms">Notificaciones por SMS</Label>
              <Switch id="notif-sms" checked={notifSMS} onCheckedChange={setNotifSMS} aria-label="Notificaciones por SMS" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-recordatorios">Recordatorios</Label>
              <Switch id="notif-recordatorios" checked={notifRecordatorios} onCheckedChange={setNotifRecordatorios} aria-label="Recordatorios" />
            </div>
          </CardContent>
        </Card>

        {/* Privacidad */}
        <Card>
          <CardHeader>
            <CardTitle>Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="priv-perfil">Perfil público</Label>
              <Switch id="priv-perfil" checked={privPerfilPublico} onCheckedChange={setPrivPerfilPublico} aria-label="Perfil público" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="priv-progreso">Compartir progreso con responsables</Label>
              <Switch id="priv-progreso" checked={privCompartirProgreso} onCheckedChange={setPrivCompartirProgreso} aria-label="Compartir progreso con responsables" />
            </div>
          </CardContent>
        </Card>

        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Tema</Label>
              <Select value={tema} onValueChange={(v) => setTema(v as 'system' | 'light' | 'dark')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Idioma</Label>
              <Select value={idioma} onValueChange={(v) => setIdioma(v as 'es' | 'en')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle>Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="correo">Correo</Label>
              <Input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={handleCancelar} aria-label="Cancelar cambios">Cancelar</Button>
        <Button onClick={handleGuardar} aria-label="Guardar cambios">Guardar cambios</Button>
      </div>
    </div>
  )
}