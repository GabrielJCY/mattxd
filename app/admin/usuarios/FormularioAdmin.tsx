"use client";
import { 
  User, 
  Mail, 
  Lock, 
  ShieldAlert, 
  ChevronRight,
  RefreshCcw,
  UserPlus,
  ChevronLeft
} from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

// BOTÓN CON ESTADO DE CARGA INTEGRADO - Adaptado para móvil
function BotonAccion({ esEdicion }: { esEdicion: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit"
      disabled={pending}
      className={`w-full py-5 md:py-6 border-[3px] md:border-4 border-black font-black uppercase italic text-lg md:text-xl transition-all flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 ${
        pending 
          ? "bg-slate-100 text-slate-400 border-slate-200 shadow-none translate-x-1 translate-y-1" 
          : "bg-black text-white hover:bg-white hover:text-black"
      }`}
    >
      {pending ? (
        <RefreshCcw className="animate-spin" size={18} />
      ) : (
        esEdicion ? <RefreshCcw className="w-5 h-5" strokeWidth={3} /> : <UserPlus className="w-5 h-5" strokeWidth={3} />
      )}
      <span className="text-sm md:text-xl">
        {pending ? "SINCRONIZANDO..." : esEdicion ? "ACTUALIZAR DATOS" : "CREAR ACCESO"}
      </span>
    </button>
  );
}

export default function FormularioAdmin({ action, initialData }: any) {
  return (
    <div className="w-full max-w-md space-y-6 px-2 md:px-0">
      {/* BOTÓN SIMPLE DE REGRESO */}
      <Link 
        href="/admin/usuarios" 
        className="inline-flex items-center gap-2 border-[3px] md:border-4 border-black px-4 md:px-6 py-2 bg-white font-black uppercase italic text-[9px] md:text-[10px] tracking-[0.1em] md:tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <ChevronLeft className="w-4 h-4 md:w-[16px] md:h-[16px]" strokeWidth={3} />
        Volver a Usuarios
      </Link>

      <form 
        action={action} 
        className="space-y-6 md:space-y-8 w-full bg-white border-[3px] md:border-4 border-black p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(241,245,249,1)] md:shadow-[16px_16px_0px_0px_rgba(241,245,249,1)]"
      >
        {/* HEADER DEL FORMULARIO */}
        <div className="border-b-2 border-black pb-4 md:pb-6 mb-2">
          <h2 className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-black">
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" strokeWidth={3} /> 
            Privilege Configuration
          </h2>
        </div>

        {initialData && <input type="hidden" name="id_admin" value={initialData.id_admin} />}
        
        {/* BLOQUE: IDENTIDAD - Adaptado Grid */}
        <div className="space-y-3 md:space-y-4">
          <label className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
            <User size={12} strokeWidth={3} /> 01. Identidad
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <input 
              name="nombre" 
              placeholder="NOMBRE" 
              defaultValue={initialData?.nombre}
              className="p-4 md:p-5 border-[3px] md:border-4 border-black font-black uppercase italic text-sm md:text-base outline-none focus:bg-slate-50 w-full placeholder:text-slate-200" 
              required 
            />
            <input 
              name="apellido" 
              placeholder="APELLIDO" 
              defaultValue={initialData?.apellido}
              className="p-4 md:p-5 border-[3px] md:border-4 border-black font-black uppercase italic text-sm md:text-base outline-none focus:bg-slate-50 w-full placeholder:text-slate-200" 
            />
          </div>
        </div>

        {/* BLOQUE: CONTACTO */}
        <div className="space-y-3 md:space-y-4">
          <label className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
            <Mail size={12} strokeWidth={3} /> 02. Credencial Email
          </label>
          <input 
            name="correo" 
            type="email"
            placeholder="CORREO@MATTBOLIVIA.COM" 
            defaultValue={initialData?.correo}
            className="p-4 md:p-5 border-[3px] md:border-4 border-black font-black uppercase italic text-sm md:text-base outline-none focus:bg-slate-50 w-full placeholder:text-slate-200" 
            required 
          />
        </div>

        {/* BLOQUE: SEGURIDAD */}
        <div className="space-y-3 md:space-y-4">
          <label className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-400">
            <Lock size={12} strokeWidth={3} /> 03. Security Key
          </label>
          <div className="relative">
            <input 
              name="password" 
              type="password"
              placeholder={initialData ? "NUEVA CLAVE (OPCIONAL)" : "CONTRASEÑA"} 
              className="p-4 md:p-5 border-[3px] md:border-4 border-black font-black uppercase italic text-sm md:text-base outline-none focus:bg-black focus:text-white transition-colors w-full placeholder:text-slate-200" 
              required={!initialData} 
            />
            {initialData && (
              <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-[7px] md:text-[8px] font-bold text-emerald-500 uppercase italic">
                <ShieldAlert size={10} /> Dejar en blanco para mantener la actual
              </div>
            )}
          </div>
        </div>

        {/* ACCIÓN PRINCIPAL */}
        <div className="pt-4 md:pt-6">
          <BotonAccion esEdicion={!!initialData} />
        </div>

        {/* DECORACIÓN TÉCNICA FOOTER */}
        <div className="flex justify-between items-center pt-2 md:pt-4 opacity-20">
          <div className="h-[2px] flex-grow bg-black mr-4"></div>
          <span className="text-[7px] md:text-[8px] font-black uppercase italic tracking-widest text-black">Root_Access</span>
        </div>
      </form>
    </div>
  );
}