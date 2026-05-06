import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ Obtener token de sesión
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // 2️⃣ USUARIO NO LOGUEADO
  if (!token) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/vendedora') || // Actualizado de /vendedor a /vendedora
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

  // 3️⃣ USUARIO LOGUEADO
  const userRole = token.role as string;
  const sucursalId = token.sucursalId as string | number | undefined;

  // 🚨 USUARIO CON GOOGLE PERO SIN REGISTRO EN DB
  if (userRole === 'registro_incompleto') {

    // ✅ MEJORA: Si el usuario viene del botón de éxito (?success=true)
    // y va al Home ("/"), lo dejamos pasar para evitar el rebote.
    const isSuccess = request.nextUrl.searchParams.get('success') === 'true';
    if (pathname === '/' && isSuccess) {
      return NextResponse.next();
    }

    // Cualquier otra ruta distinta a /registro lo manda a registro
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
      // Redirige dinámicamente al ID de sucursal que simplificamos a [id]
      const target = sucursalId ? `/vendedora/${sucursalId}` : '/vendedora';
      return NextResponse.redirect(new URL(target, request.url));
    }

    // SEGURIDAD: Evitar que una vendedora entre manualmente al ID de otra
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
      pathname.startsWith('/vendedora') // Protege la nueva ruta vendedora
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 🛡️ ADMIN tiene acceso completo
  if (userRole === 'admin') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/vendedora/:path*", // Matcher actualizado para la nueva carpeta
    "/mi-cuenta/:path*",
    "/dashboard/:path*",
    "/registro/:path*"
  ],
};