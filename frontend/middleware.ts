import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  id: string
  tipo_usuario: string
  iat: number
  exp: number
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Solo aplicar middleware a rutas específicas
  if (pathname.startsWith('/funcionario') || pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    const token = request.cookies.get('token')?.value
    
    if (!token) {
      console.log('Middleware: No token, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    try {
      const decoded = jwtDecode<DecodedToken>(token)
      
      // Verificar expiración
      if (decoded.exp * 1000 < Date.now()) {
        console.log('Middleware: Token expired')
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
      
      console.log('Middleware: User type:', decoded.tipo_usuario, 'Path:', pathname)
      
      // Permitir que el RouteGuard maneje la autorización específica
      return NextResponse.next()
      
    } catch (error) {
      console.error('Middleware: Token decode error:', error)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}