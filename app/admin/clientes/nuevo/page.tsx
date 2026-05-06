"use client";

import { useState } from "react";
import { saveCliente } from "../actions";
import { 
  Plus,
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Save,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

interface FormularioClienteProps {
  cliente?: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
  };
}

export default function FormularioCliente({ cliente }: FormularioClienteProps) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: "success" | "error" | null }>({
    texto: "",
    tipo: null,
  });

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMensaje({ texto: "", tipo: null });
    
    // La acción 'saveCliente' ya contiene revalidatePath para limpiar el caché en el servidor
    const res = await saveCliente(formData);
    
    setLoading(false);
    if (res.success) {
      setMensaje({ 
        texto: cliente ? "REGISTRO ACTUALIZADO" : "ALTA COMPLETADA", 
        tipo: "success" 
      });

      // Si es un registro nuevo, reseteamos el formulario
      if (!cliente) {
        const form = document.getElementById("cliente-form") as HTMLFormElement;
        if (form) form.reset();
      }
    } else {
      setMensaje({ 
        texto: res.message || "ERROR DEL SERVIDOR", 
        tipo: "error" 
      });
    }
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex items-center justify-center p-6">
      
      <div className="w-full max-w-lg space-y-12">
        
        {/* ENCABEZADO MINIMALISTA */}
        <header className="border-b-[3px] border-black pb-8">
          <Link href="/admin/clientes" className="inline-flex items-center gap-2 group mb-6">
            <div className="border border-black p-1 group-hover:bg-black group-hover:text-white transition-all">
               <ChevronLeft size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-black transition-colors">Volver</span>
          </Link>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-3 bg-black text-white px-4 py-1.5">
               <Plus size={16} strokeWidth={3} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">CRM Audit v1.0</span>
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">
              {cliente ? "Editar" : "Alta de"} <span className="text-slate-200 not-italic">Cliente</span>
            </h1>
          </div>
        </header>

        {/* ESTRUCTURA DEL FORMULARIO */}
        <form id="cliente-form" action={handleSubmit} className="space-y-6">
          
          {/* ID OCULTO */}
          {cliente && <input type="hidden" name="id_cliente" value={cliente.id_cliente} />}

          <div className="bg-white border-2 border-black p-10 space-y-6 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            
            {/* FILA 1: NOMBRE Y APELLIDO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   1.1 Nombre
                </label>
                <input 
                  name="nombre" 
                  required 
                  type="text" 
                  defaultValue={cliente?.nombre}
                  placeholder="EJ: JUAN"
                  className="w-full bg-slate-50 p-4 border border-slate-200 outline-none focus:bg-white focus:border-black font-black text-xs uppercase transition-all placeholder:text-slate-300 placeholder:font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   1.2 Apellido
                </label>
                <input 
                  name="apellido" 
                  type="text" 
                  defaultValue={cliente?.apellido}
                  placeholder="EJ: PEREZ"
                  className="w-full bg-slate-50 p-4 border border-slate-200 outline-none focus:bg-white focus:border-black font-black text-xs uppercase transition-all placeholder:text-slate-300 placeholder:font-mono"
                />
              </div>
            </div>

            {/* FILA 2: CORREO */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                 2.1 Email Institucional
              </label>
              <input 
                name="correo" 
                required 
                type="email" 
                defaultValue={cliente?.correo}
                placeholder="CLIENTE@MATT.BO"
                className="w-full bg-slate-50 p-4 border border-slate-200 outline-none focus:bg-white focus:border-black font-black text-xs lowercase transition-all placeholder:text-slate-300 placeholder:font-mono"
              />
            </div>

            {/* FILA 3: TELÉFONO Y PASS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   <Phone size={10} /> 3.1 Contacto
                </label>
                <input 
                  name="telefono" 
                  type="text" 
                  defaultValue={cliente?.telefono}
                  placeholder="+591 ..."
                  className="w-full bg-slate-50 p-4 border border-slate-200 outline-none focus:bg-white focus:border-black font-black text-xs transition-all placeholder:text-slate-300 placeholder:font-mono"
                />
              </div>

              <div className="space-y-1 relative">
                <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                   <Lock size={10} /> 3.2 Contraseña
                </label>
                <input 
                  name="password" 
                  required={!cliente} 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 p-4 border border-slate-200 outline-none focus:bg-white focus:border-black font-black text-xs transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* MENSAJES DE ESTADO */}
          {mensaje.texto && (
            <div className={`p-4 border-2 flex items-center justify-center gap-3 transition-all animate-in fade-in duration-300 ${
              mensaje.tipo === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'
            }`}>
              {mensaje.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <p className="text-[10px] font-black uppercase tracking-widest">
                {mensaje.texto}
              </p>
            </div>
          )}

          {/* BOTÓN "FLOTANTE" */}
          <div className="pt-6">
            <button 
              disabled={loading}
              type="submit"
              className="w-full group relative bg-black text-white p-6 border border-black hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-3 font-black text-[11px] uppercase tracking-[0.4em]">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="animate-pulse">Sincronizando...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {cliente ? "Guardar Cambios" : "Confirmar Alta"}
                  </>
                )}
              </div>
            </button>
          </div>

        </form>

        <footer className="text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] italic">
          Matt Bolivia | Secure Database Terminal v2.1
        </footer>
      </div>
    </div>
  );
}