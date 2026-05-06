"use client";
import { useState } from "react";
import { updatePerfilAction, updateClientePasswordAction } from "@/src/lib/actions";
import { Check, Loader2, Eye, EyeOff, ShieldCheck, Lock, UserCircle } from "lucide-react";

export function PerfilForm({ idCliente, nombreInicial }: { idCliente: number, nombreInicial: string }) {
  // Estados para Perfil
  const [nombre, setNombre] = useState(nombreInicial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Estados para Contraseña
  const [showPass, setShowPass] = useState(false);
  const [passData, setPassData] = useState({ actual: "", nueva: "", confirm: "" });
  const [passStatus, setPassStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Manejador para actualizar Nombre
  const handleUpdateNombre = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const res = await updatePerfilAction(idCliente, nombre);
    if (res.success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('idle');
      alert("Error al actualizar el nombre");
    }
  };

  // Manejador para actualizar Contraseña
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passData.nueva !== passData.confirm) {
      alert("Las nuevas contraseñas no coinciden.");
      return;
    }

    if (passData.nueva.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setPassStatus('loading');
    const res = await updateClientePasswordAction(idCliente, passData.actual, passData.nueva);
    
    if (res.success) {
      setPassStatus('success');
      setPassData({ actual: "", nueva: "", confirm: "" });
      setTimeout(() => setPassStatus('idle'), 3000);
    } else {
      setPassStatus('idle');
      alert(res.message || "Error al actualizar la contraseña");
    }
  };

  return (
    <div className="space-y-16">
      {/* SECCIÓN: INFORMACIÓN PERSONAL */}
      <form onSubmit={handleUpdateNombre} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <UserCircle size={14} className="text-[#F57C00]" />
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2E2E2E]">
              Nombre Completo del Cliente
            </label>
          </div>
          <input 
            type="text" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            // CAMBIO CLAVE: text-[#2E2E2E] para que sea negro y bordes industriales
            className="w-full bg-[#F5F5F5] border-b-2 border-zinc-200 p-4 text-xl font-black uppercase tracking-tighter text-[#2E2E2E] focus:outline-none focus:border-[#F57C00] transition-colors"
            placeholder="INGRESE SU NOMBRE"
          />
        </div>

        <button 
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-4 bg-[#F57C00] text-white font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#D46B00] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-md"
        >
          {status === 'loading' ? <Loader2 className="animate-spin" size={16} /> : 
           status === 'success' ? <Check size={16} /> : null}
          {status === 'success' ? "CAMBIOS GUARDADOS" : "ACTUALIZAR DATOS DE PERFIL"}
        </button>
      </form>

      {/* SECCIÓN: SEGURIDAD / CONTRASEÑA */}
      <form onSubmit={handleUpdatePassword} className="pt-12 border-t-2 border-zinc-100 space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#2E2E2E] rounded-md">
            <Lock size={16} className="text-[#FDD835]" />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2E2E2E]">
            Mantenimiento de Seguridad
          </h2>
        </div>

        <div className="grid gap-4">
          {/* Contraseña Actual */}
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"}
              placeholder="CONTRASEÑA ACTUAL"
              value={passData.actual}
              onChange={(e) => setPassData({...passData, actual: e.target.value})}
              // CAMBIO CLAVE: bg-white, borde zinc y text-[#2E2E2E]
              className="w-full bg-white border border-zinc-200 p-4 text-[11px] font-bold tracking-widest text-[#2E2E2E] placeholder:text-zinc-400 focus:outline-none focus:border-[#2E2E2E] transition-all"
            />
          </div>

          {/* Nueva Contraseña */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                placeholder="NUEVA CONTRASEÑA"
                value={passData.nueva}
                onChange={(e) => setPassData({...passData, nueva: e.target.value})}
                className="w-full bg-white border border-zinc-200 p-4 text-[11px] font-bold tracking-widest text-[#2E2E2E] placeholder:text-zinc-400 focus:outline-none focus:border-[#2E2E2E] transition-all"
              />
            </div>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                placeholder="CONFIRMAR NUEVA"
                value={passData.confirm}
                onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                className="w-full bg-white border border-zinc-200 p-4 text-[11px] font-bold tracking-widest text-[#2E2E2E] placeholder:text-zinc-400 focus:outline-none focus:border-[#2E2E2E] transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#2E2E2E] transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={passStatus === 'loading'}
          className="w-full md:w-auto px-8 py-4 bg-[#2E2E2E] text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {passStatus === 'loading' ? <Loader2 className="animate-spin" size={14} /> : 
           passStatus === 'success' ? <Check size={14} /> : null}
          {passStatus === 'success' ? "CREDENCIALES ACTUALIZADAS" : "MODIFICAR CONTRASEÑA"}
        </button>
      </form>
    </div>
  );
}