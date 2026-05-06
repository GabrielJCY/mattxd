"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, User, Mail, Lock, Phone, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { MattLogo } from "@/components/matt-logo";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registrarNuevoCliente } from "./actions";

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  const [errorMsg, setErrorMsg] = useState<string | null>(null); 
  
  const { data: session, update } = useSession();
  const router = useRouter();
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    setMounted(true);
    if (session?.user) {
      const user = session.user as any;
      if (user.firstName) setValue("nombre", user.firstName.toUpperCase());
      if (user.lastName) setValue("apellido", user.lastName.toUpperCase());
      if (user.email) setValue("correo", user.email.toLowerCase());
    }
  }, [session, setValue]);

  // 🔥 REDIRECCIÓN MEJORADA: Añade el parámetro success para saltar el Middleware
  const handleGoHome = async () => {
    setRedirecting(true);
    try {
      // Intentamos refrescar el token en el cliente
      await update(); 
      
      // Usamos success=true para que el Middleware sepa que acabamos de terminar
      window.location.href = "/?success=true"; 
    } catch (e) {
      window.location.href = "/?success=true";
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    
    const formData = new FormData();
    formData.append("nombre", data.nombre.trim());
    formData.append("apellido", data.apellido.trim());
    formData.append("correo", data.correo.trim());
    formData.append("telefono", data.telefono.trim());
    formData.append("password", data.password || "google_auth_account");

    try {
      const res = await registrarNuevoCliente(formData);

      if (res.success) {
        setIsSuccess(true);
        // Disparamos el update preventivo
        update().then(() => router.refresh());
      } else {
        setErrorMsg(res.message || "Error al registrar cuenta");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Error de conexión con el servidor");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 bg-[#0a0a0a] font-sans text-white">
      
      <div className="absolute inset-0 z-0 opacity-40">
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/fondo-matt.png')", 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) contrast(1.2)', 
          }}
          animate={{ scale: [1.02, 1, 1.02] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-20 w-full max-w-[480px]"
      >
        <Card className="border border-white/10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form-side"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <CardHeader className="pt-12 pb-6 flex flex-col items-center text-center relative">
                  {!loading && (
                    <Link href="/login" className="absolute left-8 top-12 text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                  )}
                  <MattLogo className="w-[120px] h-auto mb-4" />
                  <CardDescription className="text-[9px] uppercase font-bold tracking-[0.6em] text-zinc-500">
                    {session?.user ? "COMPLETA TU PERFIL" : "CREAR CUENTA MATT"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-10 pb-12">
                  <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
                    
                    <div className="relative col-span-1">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <Input 
                        {...register("nombre", { required: true })} 
                        placeholder="NOMBRE" 
                        className="h-11 pl-10 rounded-xl border-white/5 bg-white/5 text-white text-[10px] font-bold tracking-widest uppercase focus:bg-white/10 transition-all placeholder:text-zinc-700" 
                      />
                    </div>

                    <div className="relative col-span-1">
                      <Input 
                        {...register("apellido", { required: true })} 
                        placeholder="APELLIDO" 
                        className="h-11 px-4 rounded-xl border-white/5 bg-white/5 text-white text-[10px] font-bold tracking-widest uppercase focus:bg-white/10 transition-all placeholder:text-zinc-700" 
                      />
                    </div>

                    <div className="relative col-span-2">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <Input 
                        {...register("correo", { required: true })} 
                        type="email" 
                        readOnly={!!session?.user}
                        placeholder="EMAIL" 
                        className={`h-11 pl-10 rounded-xl border-white/5 bg-white/5 text-white text-[10px] font-bold tracking-widest uppercase transition-all placeholder:text-zinc-700 ${session?.user ? "opacity-40 cursor-not-allowed" : "focus:bg-white/10"}`} 
                      />
                    </div>

                    <div className="relative col-span-2">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <Input 
                        {...register("telefono", { required: true })} 
                        placeholder="WHATSAPP" 
                        className="h-11 pl-10 rounded-xl border-white/5 bg-white/5 text-white text-[10px] font-bold tracking-widest uppercase focus:bg-white/10 transition-all placeholder:text-zinc-700" 
                      />
                    </div>

                    <div className="relative col-span-2">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                      <Input 
                        {...register("password", { required: !session?.user })} 
                        type="password" 
                        disabled={!!session?.user}
                        placeholder={session?.user ? "GOOGLE AUTH" : "CONTRASEÑA"} 
                        className="h-11 pl-10 rounded-xl border-white/5 bg-white/5 text-white text-[10px] font-bold tracking-widest uppercase disabled:opacity-20 transition-all placeholder:text-zinc-700" 
                      />
                    </div>

                    <AnimatePresence>
                      {errorMsg && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="col-span-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-[9px] font-bold uppercase tracking-wider mb-2"
                        >
                          <AlertCircle size={14} />
                          {errorMsg}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="col-span-2 h-12 bg-white hover:bg-zinc-200 text-black rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all mt-2 active:scale-[0.98]"
                    >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : "REGISTRARME AHORA"}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="success-side"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20 }}
                className="flex flex-col items-center justify-center text-center p-12 min-h-[500px]"
              >
                <div className="relative mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-white rounded-full"
                  />
                  <div className="bg-white rounded-full p-5 relative z-10 shadow-xl">
                    <CheckCircle2 size={48} className="text-black" strokeWidth={2} />
                  </div>
                </div>
                
                <h2 className="text-white font-black text-xl uppercase tracking-[0.5em] mb-2">
                  ¡BIENVENIDO!
                </h2>
                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.4em] leading-relaxed mb-10 max-w-[200px]">
                  TU CUENTA HA SIDO CREADA CORRECTAMENTE
                </p>

                <Button 
                  onClick={handleGoHome}
                  disabled={redirecting}
                  className="w-full max-w-[240px] h-12 bg-white hover:bg-zinc-200 text-black rounded-full font-black uppercase text-[10px] tracking-[0.4em] transition-all flex items-center justify-center gap-3 group shadow-xl active:scale-[0.95]"
                >
                  {redirecting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      ENTRAR A LA TIENDA
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}