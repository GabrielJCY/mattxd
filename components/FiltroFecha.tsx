"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, X } from "lucide-react";

export function FiltroFecha() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fechaActual = searchParams.get("fecha") || "";

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("fecha", e.target.value);
    } else {
      params.delete("fecha");
    }
    router.push(`/admin/movimientos?${params.toString()}`);
  };

  const limpiarFecha = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("fecha");
    router.push(`/admin/movimientos?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 border-2 border-black px-3 py-2 bg-white hover:bg-slate-50 transition-all">
      <CalendarIcon size={14} className="text-slate-400" />
      <input
        type="date"
        value={fechaActual}
        onChange={handleFechaChange}
        className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
        style={{ colorScheme: 'light' }} // Asegura que el icono del calendario del navegador se vea bien
      />
      {fechaActual && (
        <button onClick={limpiarFecha} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}