import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Clock } from "lucide-react"

export function QuickHelp() {
  return (
    <Card className="bg-amber-50 border border-amber-300 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-amber-800 text-center">🆘 Ayuda Rápida</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <Button className="w-full bg-coral-500 hover:bg-coral-600 text-white h-10 text-sm">
          <Phone className="w-4 h-4 mr-1" />
          (123) 456-7890
        </Button>

        <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white h-10 text-sm">
          <MessageCircle className="w-4 h-4 mr-1" />
          WhatsApp
        </Button>

        <div className="bg-white p-2 rounded border border-amber-300">
          <div className="flex items-center text-amber-800 mb-1">
            <Clock className="w-3 h-3 mr-1" />
            <span className="text-xs font-semibold">Horarios:</span>
          </div>
          <p className="text-xs text-amber-700">
            Lun-Vie: 7AM-5PM
            <br />
            Sáb: 8AM-12PM
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
