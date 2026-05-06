"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react"; 
import { loginUniversal } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { MattLogo } from "@/components/matt-logo";

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className || "mr-3 h-4 w-4"} aria-hidden="true" focusable="false" viewBox="0 0 488 512">
    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
  </svg>
);

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit } = useForm();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setServerError("");
    
    const formData = new FormData();
    formData.append("correo", data.correo);
    formData.append("password", data.password);

    try {
      const result = await loginUniversal(formData);
      if (result?.error) {
        setServerError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err.message !== "NEXT_REDIRECT") {
        setServerError("Credenciales no autorizadas");
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/auth-callback" });
    } catch (err) {
      console.error("Error en Google Auth:", err);
      setServerError("Error al conectar con Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-6 bg-zinc-900 font-sans selection:bg-[#F57C00] selection:text-white">
      
      {/* 1. FONDO CINEMÁTICO - A COLOR */}
      <div className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out" style={{ opacity: mounted ? 1 : 0 }}>
        {mounted && (
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/fondo-matt.jpg')", 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'contrast(1.1) brightness(0.8)', 
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* 2. OVERLAY PARA MEJORAR CONTRASTE */}
      <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />

      {/* 3. TARJETA DE LOGIN - TRANSPARENTE / GLASSMORPHISM */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 w-full max-w-[440px]"
      >
        <Card className="border border-white/20 bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Acento Industrial en la parte superior */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#F57C00] to-transparent opacity-70" />

          <CardHeader className="pt-10 pb-6 flex flex-col items-center border-none">
            <MattLogo className="w-[150px] h-auto mb-4 fill-white drop-shadow-md" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5">
              <ShieldCheck size={12} className="text-[#F57C00]" />
              <CardDescription className="text-[9px] uppercase font-bold tracking-[0.3em] text-zinc-300">
                Secure Terminal Access
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-10 space-y-5">
            
            <Button 
              onClick={handleGoogleAuth}
              variant="outline"
              disabled={loading}
              className="w-full h-14 bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black rounded-xl font-bold text-[10px] tracking-[0.15em] transition-all flex items-center justify-center group"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <GoogleIcon className="mr-3 h-4 w-4" />
                  CONTINUAR CON GOOGLE
                </>
              )}
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-[8px] font-black text-zinc-500 uppercase tracking-widest">or secure login</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#F57C00] transition-colors" size={16} />
                  <input 
                    {...register("correo", { required: true })}
                    type="email" 
                    placeholder="EMAIL ADDRESS" 
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#F57C00]/50 font-bold text-[11px] tracking-wider transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#F57C00] transition-colors" size={16} />
                  <input 
                    {...register("password", { required: true })}
                    type={showPassword ? "text" : "password"} 
                    placeholder="PASSWORD" 
                    className="w-full h-12 pl-12 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#F57C00]/50 font-bold text-[11px] tracking-wider transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {serverError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                  >
                    <AlertTriangle size={14} /> {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-[#F57C00] hover:bg-[#ff8c1a] text-white rounded-xl font-black uppercase text-[11px] tracking-[0.3em] transition-all active:scale-95 group shadow-xl shadow-[#F57C00]/20"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <span className="flex items-center gap-2">
                    AUTHORIZE ACCESS <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>

            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={handleGoogleAuth}
                className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                New user? <span className="text-white font-black underline underline-offset-4 ml-1">Use Google account</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer minimalista */}
      <footer className="absolute bottom-6 z-30">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.6em]">
          Matt Bolivia &bull; System v2.0
        </p>
      </footer>
    </div>
  );
}