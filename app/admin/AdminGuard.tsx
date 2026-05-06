"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ArrowRight, ShieldAlert, Loader2, Cpu, Fingerprint } from "lucide-react";
// Importamos la función que ya creaste en tus actions
import { verifyAdminKey } from "./usuarios/actions"; 

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStorage, setCheckingStorage] = useState(true);

  useEffect(() => {
    const isAuth = sessionStorage.getItem("matt_admin_verified");
    if (isAuth === "true") {
      setAuthorized(true);
    }
    setCheckingStorage(false);
  }, []);

  const handleVerify = async () => {
    if (!pass.trim() || loading) return;
    
    setLoading(true);
    setError(false);

    try {
      // Usamos la función de servidor que me pasaste
      const result = await verifyAdminKey(pass);

      if (result.success) {
        sessionStorage.setItem("matt_admin_verified", "true");
        setAuthorized(true);
      } else {
        setError(true);
        setPass(""); 
      }
    } catch (err) {
      console.error("Auth Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (checkingStorage) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-white font-sans overflow-hidden">
        
        {/* FONDO AMBIENTAL */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-60" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 max-w-[400px] w-full"
        >
          {/* ICONO Y CABECERA */}
          <div className="text-center mb-10">
            <div className="inline-flex p-5 rounded-3xl bg-gradient-to-b from-zinc-800 to-black border border-white/10 mb-6 shadow-2xl relative group">
              <div className="absolute inset-0 bg-white/5 blur-xl group-hover:bg-white/10 transition-all rounded-full" />
              <Fingerprint size={32} className={error ? "text-red-500 animate-bounce" : "text-white relative z-10"} />
            </div>
            <h2 className="text-[11px] tracking-[0.8em] uppercase font-black text-white/40 leading-tight">
               Área Crítica <br /> 
              <span className="text-white">Validar Identidad Admin</span>
            </h2>
          </div>

          {/* FORMULARIO DE ACCESO */}
          <div className="space-y-6">
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="CONTRASEÑA"
                disabled={loading}
                className={`w-full bg-black/50 backdrop-blur-xl border ${error ? 'border-red-500/50 text-red-500' : 'border-white/10 text-white'} py-6 px-14 rounded-2xl text-center tracking-[0.4em] outline-none focus:border-white/30 transition-all font-mono text-sm shadow-inner`}
              />
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-red-500"
                  >
                    <ShieldAlert size={12} />
                    <span className="text-[9px] uppercase font-black tracking-widest text-red-500/80">
                      Clave de Seguridad Incorrecta
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleVerify}
              disabled={loading || !pass}
              className="group relative w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <span className="relative z-10 flex items-center gap-3">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Desbloquear Sistema
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                  </>
                )}
              </span>
            </button>
          </div>

          <footer className="mt-20 text-center">
            <p className="text-[8px] uppercase font-black tracking-[0.5em] text-white/10 italic">
              Matt Bolivia High-Security Terminal v2.6
            </p>
          </footer>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}