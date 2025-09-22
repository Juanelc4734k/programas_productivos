import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, GraduationCap, Phone, Calendar, MapPin, Download, ChevronRight } from "lucide-react"
import Link from "next/link" // Añadir esta importación

const actions = [
  {
    title: "Solicitar Trámite",
    description: "Insumos, asistencia técnica",
    icon: FileText,
    color: "bg-blue-500 hover:bg-blue-600",
    shortDesc: "Trámites",
    href: "/user/tramites",
  },
  {
    title: "Inscribirse a Programa",
    description: "Nuevos programas disponibles",
    icon: Users,
    color: "bg-emerald-500 hover:bg-emerald-600",
    shortDesc: "Programas",
    href: "/user/programs",
  },
  {
    title: "Ver Capacitaciones",
    description: "Cursos y talleres",
    icon: GraduationCap,
    color: "bg-purple-500 hover:bg-purple-600",
    shortDesc: "Capacitaciones",
    href: "/user/capacitaciones",
  },
  {
    title: "Contactar Funcionario",
    description: "Hablar con un asesor",
    icon: Phone,
    color: "bg-amber-500 hover:bg-amber-600",
    shortDesc: "Contacto",
  },
]

const secondaryActions = [
  {
    title: "Calendario de eventos",
    icon: Calendar,
    href: "/user/calendario",
  },
  {
    title: "Mapa de proyectos",
    icon: MapPin,
    href: "/user/mapa",
  },
  {
    title: "Descargar certificados",
    icon: Download,
    href: "/user/certificados",
  },
]

export function QuickActions() {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2 sm:gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Link key={index} href={action.href || '#'} className="w-full">
                <Button
                  className={`w-full h-auto p-3 sm:p-4 ${action.color} text-white justify-start group transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-center w-full">
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mr-2 sm:mr-3" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base">
                        <span className="hidden sm:inline">{action.title}</span>
                        <span className="sm:hidden">{action.shortDesc}</span>
                      </div>
                      <div className="text-xs sm:text-sm opacity-90 hidden sm:block truncate">{action.description}</div>
                    </div>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Acciones secundarias */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
          <div className="space-y-1 sm:space-y-2">
            {secondaryActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link key={index} href={action.href || '#'} className="w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-8 mb-3 sm:h-9 text-xs sm:text-sm hover:bg-gray-50 border-gray-200"
                  >
                    <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{action.title}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Botón de ayuda rápida en móviles */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 sm:hidden">
          <Button className="w-full bg-red-500 hover:bg-red-600 text-white h-10">
            <Phone className="w-4 h-4 mr-2" />
            Ayuda: (123) 456-7890
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
