"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Phone, Mail, Clock, User, Bot, Minimize2, Maximize2 } from "lucide-react"
import { toast } from "sonner"
import { API_BASE_URL } from "@/lib/config"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant" | "system"
  timestamp: Date
}

interface ChatResponse {
  success: boolean
  data: {
    response: string
    sessionId: string
    timestamp: string
    metadata?: any
  }
}

export function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Función para hacer scroll automático al final del chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Función para formatear las respuestas del chatbot
  const formatBotResponse = (content: string) => {
    // Dividir el contenido en líneas
    const lines = content.split('\n')
    const formattedLines: JSX.Element[] = []
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) {
        formattedLines.push(<br key={`br-${index}`} />)
        return
      }
      
      // Detectar listas numeradas (1. 2. 3. etc.)
      const numberedListMatch = trimmedLine.match(/^(\d+\.)\s*\*\*(.+?)\*\*:?\s*(.*)$/)
      if (numberedListMatch) {
        const [, number, title, description] = numberedListMatch
        formattedLines.push(
          <div key={index} className="mb-3">
            <div className="flex items-start space-x-2">
              <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] text-center">
                {number.replace('.', '')}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">{title}</div>
                {description && <div className="text-gray-700 text-sm">{description}</div>}
              </div>
            </div>
          </div>
        )
        return
      }
      
      // Detectar texto en negrita **texto**
      const boldTextRegex = /\*\*(.+?)\*\*/g
      if (boldTextRegex.test(trimmedLine)) {
        const parts = trimmedLine.split(boldTextRegex)
        const formattedParts = parts.map((part, partIndex) => {
          if (partIndex % 2 === 1) {
            return <strong key={partIndex} className="font-semibold text-gray-900">{part}</strong>
          }
          return part
        })
        formattedLines.push(
          <div key={index} className="mb-2">
            {formattedParts}
          </div>
        )
        return
      }
      
      // Línea normal
      formattedLines.push(
        <div key={index} className="mb-2">
          {trimmedLine}
        </div>
      )
    })
    
    return <div className="space-y-1">{formattedLines}</div>
  }

  // Función para obtener el token de autenticación
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  // Función para inicializar el chat
  const initializeChat = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        toast.error('Debes iniciar sesión para usar el chat')
        return
      }

      // Iniciar nueva sesión
      const sessionResponse = await fetch(`${API_BASE_URL}/chatbot/session/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json()
        setSessionId(sessionData.data.sessionId)
        
        // Agregar mensaje de bienvenida
        const welcomeMessage: Message = {
          id: '1',
          content: sessionData.data.message,
          sender: 'assistant',
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }

      // Obtener respuestas rápidas
      const quickRepliesResponse = await fetch(`${API_BASE_URL}/chatbot/quick-replies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (quickRepliesResponse.ok) {
        const quickRepliesData = await quickRepliesResponse.json()
        setQuickReplies(quickRepliesData.data)
      }
    } catch (error) {
      console.error('Error al inicializar chat:', error)
      toast.error('Error al conectar con el asistente virtual')
    }
  }

  // Función para enviar mensaje a la API
  const sendMessageToAPI = async (message: string): Promise<string> => {
    const token = getAuthToken()
    if (!token) {
      throw new Error('Token de autenticación no encontrado')
    }

    const response = await fetch(`${API_BASE_URL}/chatbot/message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) {
      throw new Error('Error al enviar mensaje')
    }

    const data: ChatResponse = await response.json()
    return data.data.response
  }

  // Inicializar chat al montar el componente
  useEffect(() => {
    initializeChat()
  }, [])

  // Scroll automático cuando se agreguen nuevos mensajes
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickQuestions = quickReplies.length > 0 ? quickReplies : [
    "¿Cómo solicito insumos agrícolas?",
    "¿Cuándo son las próximas capacitaciones?",
    "¿Cómo reporto el avance de mi proyecto?",
    "¿Dónde descargo mis certificados?",
  ]

  const handleSend = async (message?: string) => {
    const messageToSend = message || input
    if (!messageToSend.trim()) return

    const token = getAuthToken()
    if (!token) {
      toast.error('Debes iniciar sesión para usar el chat')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const assistantResponse = await sendMessageToAPI(messageToSend)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        sender: "assistant",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      toast.error('Error al enviar mensaje. Inténtalo de nuevo.')
      
      // Mensaje de error para el usuario
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo o contacta al soporte técnico.',
        sender: "assistant",
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Asistente Virtual
            <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
              En línea
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-3 sm:p-4">
          {/* Preguntas frecuentes */}
          <div className="mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Preguntas frecuentes:</p>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 sm:p-3 text-left text-xs sm:text-sm hover:bg-gray-50 justify-start"
                  onClick={() => handleSend(question)}
                >
                  <span className="line-clamp-2">{question}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Chat messages */}
          <div className="h-48 sm:h-64 overflow-y-auto mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "assistant" && (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-2 sm:px-3 py-2 rounded-lg ${
                      message.sender === "user" ? "bg-emerald-600 text-white" : "bg-white border border-gray-200"
                    }`}
                  >
                    {message.sender === "assistant" ? (
                      <div className="text-xs sm:text-sm leading-relaxed">
                        {formatBotResponse(message.content)}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${message.sender === "user" ? "text-emerald-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
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
                  </div>
                </div>
              )}
              
              {/* Referencia para scroll automático */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Contact options */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">¿Necesitas ayuda personalizada?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Llamar</span>
                <span className="sm:hidden">Tel</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Agendar</span>
                <span className="sm:hidden">Cita</span>
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
