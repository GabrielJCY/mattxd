"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/**
 * AUTH CALLBACK UNIT - MATT BOLIVIA 2026
 * Protocolo de Enrutamiento Inteligente Optimizado
 */
export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // 1. MODO ESPERA: Si está cargando, no hacemos nada.
    if (status === "loading") return;

    // 2. MODO AUTENTICADO: Google confirmó quién eres.
    if (status === "authenticated" && session) {
      // Tipado extendido para incluir sucursalId
      const user = session.user as { role?: string; email?: string; sucursalId?: string | number };
      
      // 🛡️ SEGURIDAD: Esperar a que el JWT inyecte el rol
      if (!user.role) {
        console.warn("⚠️ Clearance Level Undefined. Waiting for token data...");
        return; 
      }

      console.log("✅ Identity Verified. Role:", user.role);

      // --- PROTOCOLO DE ENRUTAMIENTO ---
      if (user.role === "admin") {
        router.push("/admin");
      } 
      else if (user.role === "vendedor") {
        // EDITADO: Redirige a /vendedora/[id] usando el sucursalId
        if (user.sucursalId) {
          router.push(`/vendedora/${user.sucursalId}`);
        } else {
          router.push("/vendedora"); 
        }
      } 
      else {
        // Usuarios comunes (Clientes)
        router.push("/"); 
      }
    } 
    
    // 3. MODO FALLIDO: No hay sesión activa
    else if (status === "unauthenticated") {
      console.error("❌ Access Denied. Returning to Gateway.");
      const timeout = setTimeout(() => {
        router.push("/login?error=AccessDenied");
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-sans overflow-hidden">
      
      {/* Visual FX */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-20 animate-pulse" />

      {/* Spinner Táctico */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-[1px] border-white/10 rounded-full" />
        <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin" />
        <div className="absolute inset-4 border-[1px] border-white/5 rounded-full animate-ping" />
      </div>

      <div className="relative z-10 text-center space-y-3">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <p className="text-[10px] uppercase font-black tracking-[0.8em] text-white">
            Authenticating Unit
          </p>
          <div className="flex items-center justify-center gap-2">
             <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
             <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
             <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
        
        <p className="text-[7px] uppercase font-bold tracking-[0.4em] text-zinc-600">
          Verifying Security Clearance
        </p>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 opacity-10 flex flex-col items-center">
        <p className="text-[8px] font-mono tracking-widest uppercase mb-2">Matt Bolivia Secure Gateway</p>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
      </div>
    </div>
  );
}