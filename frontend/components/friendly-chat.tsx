"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Heart, User, Mic } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export function FriendlyChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! 😊 Soy tu amiga virtual. ¿En qué te puedo ayudar hoy?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const quickReplies = [
    "¿Cómo van mis cultivos?",
    "¿Cuándo llegan las semillas?",
    "¿Cómo pido ayuda?",
    "¿Hay capacitaciones?",
  ]

  const handleSend = async (message?: string) => {
    const messageToSend = message || input
    if (!messageToSend.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getFriendlyResponse(messageToSend),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  const getFriendlyResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("cultivo") || input.includes("van mis")) {
      return "¡Qué bueno que preguntes! 🌱 Tus cultivos van muy bien. Tu café lleva 75% de avance. ¿Quieres más detalles?"
    }

    if (input.includes("semilla") || input.includes("llegan")) {
      return "¡Excelente! 📦 Las semillas llegan este viernes a la alcaldía. Te avisaremos por mensaje."
    }

    if (input.includes("ayuda") || input.includes("pedir")) {
      return "¡Claro que te ayudo! 🤝 Puedes pedir ayuda aquí conmigo, llamando o yendo a la alcaldía. ¿Qué necesitas?"
    }

    if (input.includes("capacitacion") || input.includes("aprender")) {
      return '¡Perfecto! 📚 Hay capacitación de "Manejo del Café" el 15 de enero. Gratis con almuerzo. ¿Te inscribes?'
    }

    return "Entiendo 😊 Te ayudo con cultivos, trámites, capacitaciones y más. ¿Puedes contarme qué necesitas específicamente?"
  }

  return (
    <div className="space-y-4">
      {/* Respuestas rápidas con nuevos colores */}
      <div className="grid grid-cols-2 gap-2">
        {quickReplies.map((reply, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleSend(reply)}
            className="text-xs h-8 border border-indigo-200 hover:bg-indigo-50 text-left"
          >
            {reply}
          </Button>
        ))}
      </div>

      {/* Chat messages con nueva paleta */}
      <div className="h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.sender === "bot" && (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-4 h-4 text-white" />
              </div>
            )}
            <Card
              className={`max-w-xs p-3 ${
                message.sender === "user" ? "bg-coral-500 text-white" : "bg-white border border-indigo-200"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </Card>
            {message.sender === "user" && (
              <div className="w-8 h-8 bg-gradient-to-br from-coral-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <Card className="p-3 bg-white border border-indigo-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input area con nuevos colores */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" className="border border-indigo-200 hover:bg-indigo-50 px-3">
          <Mic className="w-4 h-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta... 😊"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
          className="border border-indigo-200 focus:border-indigo-400"
        />
        <Button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          size="sm"
          className="bg-indigo-500 hover:bg-indigo-600 px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
