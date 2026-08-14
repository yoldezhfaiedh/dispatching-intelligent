import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export function proxy(request: NextRequest) { if (request.nextUrl.pathname === '/login') return NextResponse.next(); if (!request.cookies.has('dispatch_user')) return NextResponse.redirect(new URL('/login', request.url)); return NextResponse.next() }
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
