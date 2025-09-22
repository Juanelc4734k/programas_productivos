"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy? Puedo ayudarte con información sobre programas, trámites, y más.",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(input),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("tramite") || input.includes("trámite")) {
      return 'Para realizar trámites, puedes acceder a la sección "Trámites" donde encontrarás: solicitud de insumos, asistencia técnica, inscripción a programas y descarga de certificados. ¿Qué trámite específico necesitas realizar?'
    }

    if (input.includes("programa")) {
      return "Tenemos varios programas productivos activos: Café Sostenible, Agricultura Familiar, Ganadería Sostenible, y Cultivos Alternativos. ¿Te interesa información sobre algún programa en particular?"
    }

    if (input.includes("capacitacion") || input.includes("capacitación")) {
      return 'Ofrecemos capacitaciones en: técnicas agrícolas, manejo de cultivos, comercialización, y uso de tecnología. La próxima capacitación es sobre "Manejo Sostenible del Café" el 15 de enero. ¿Te gustaría inscribirte?'
    }

    if (input.includes("clima") || input.includes("tiempo")) {
      return "Puedes consultar el pronóstico del tiempo en el panel informativo. También enviamos alertas sobre condiciones climáticas que puedan afectar los cultivos. ¿Necesitas información específica sobre el clima?"
    }

    return "Entiendo tu consulta. Te puedo ayudar con información sobre programas productivos, trámites, capacitaciones, clima, y navegación en la plataforma. ¿Podrías ser más específico sobre lo que necesitas?"
  }

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "bot" && (
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <Card className={`max-w-xs p-3 ${message.sender === "user" ? "bg-blue-600 text-white" : "bg-white"}`}>
              <p className="text-sm">{message.content}</p>
            </Card>
            {message.sender === "user" && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card className="p-3 bg-white">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta aquí..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
