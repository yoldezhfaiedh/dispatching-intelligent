import { auth } from '@/auth'
import { NextResponse } from 'next/server'

// Filtre de confort : evite d'afficher une page vide a un visiteur non
// connecte. Le controle reel se fait cote NestJS via les guards Keycloak.
export const proxy = auth((request) => {
  const { pathname } = request.nextUrl

  if (pathname === '/login') {
    if (request.auth) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }

  if (!request.auth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}