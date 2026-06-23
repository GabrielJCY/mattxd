import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ Obtener token de sesión de GOOGLE (NextAuth)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // 1.5️⃣ Obtener sesión MANUAL (Base de datos / Turso)
  const manualCookie = request.cookies.get('matt_session')?.value;
  let manualSession = null;
  if (manualCookie) {
    try {
      manualSession = JSON.parse(manualCookie);
    } catch (e) {
      console.error("Error leyendo matt_session", e);
    }
  }

  // 2️⃣ USUARIO NO LOGUEADO (Ni por Google ni Manual)
  if (!token && !manualSession) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/vendedora') || 
      pathname.startsWith('/mi-cuenta') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/registro')
    ) {
      const url = new URL('/login', request.url);
      url.searchParams.set('error', 'SessionRequired');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3️⃣ UNIFICAR VARIABLES (Sea de Google o Manual)
  let userRole = '';
  let sucursalId: string | number | undefined = undefined;

  if (token) {
    // Viene de Google
    userRole = token.role as string;
    sucursalId = token.sucursalId as string | number | undefined;
  } else if (manualSession) {
    // Viene de la base de datos manual
    // En actions.ts lo guardas como 'empleado', aquí lo normalizamos a 'vendedor'
    userRole = manualSession.role === 'empleado' ? 'vendedor' : manualSession.role;
    // (Opcional) Si en el futuro guardas el sucursalId en la cookie manual, lo leería aquí:
    sucursalId = manualSession.id_sucursal; 
  }

  // 🚨 USUARIO CON GOOGLE PERO SIN REGISTRO EN DB
  if (userRole === 'registro_incompleto') {
    const isSuccess = request.nextUrl.searchParams.get('success') === 'true';
    if (pathname === '/' && isSuccess) {
      return NextResponse.next();
    }
    if (!pathname.startsWith('/registro')) {
      return NextResponse.redirect(new URL('/registro', request.url));
    }
    return NextResponse.next();
  }

  // ⛔ USUARIOS YA REGISTRADOS NO PUEDEN IR A /registro
  if (
    userRole !== 'registro_incompleto' &&
    pathname.startsWith('/registro')
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 🛡️ PROTECCIÓN PARA VENDEDORES
  if (userRole === 'vendedor') {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/mi-cuenta') ||
      pathname.startsWith('/dashboard')
    ) {
      const target = sucursalId ? `/vendedora/${sucursalId}` : '/vendedora';
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (pathname.startsWith('/vendedora/')) {
      const requestedId = pathname.split('/')[2];
      if (sucursalId && requestedId !== sucursalId.toString()) {
        return NextResponse.redirect(new URL(`/vendedora/${sucursalId}`, request.url));
      }
    }
  }

  // 🛡️ PROTECCIÓN PARA CLIENTES
  if (userRole === 'cliente') {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/vendedora')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 🛡️ ADMIN tiene acceso completo a todo
  if (userRole === 'admin') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/vendedora/:path*",
    "/mi-cuenta/:path*",
    "/dashboard/:path*",
    "/registro/:path*"
  ],
};