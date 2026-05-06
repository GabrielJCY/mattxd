"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FiltrosProductos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [busqueda, setBusqueda] = useState(searchParams.get("q") || "");

  // 🔄 Efecto para actualizar la URL cuando el usuario deja de escribir
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (busqueda) {
        params.set("q", busqueda);
      } else {
        params.delete("q");
      }
      // El { scroll: false } evita que la página salte arriba al buscar
      router.push(`/admin/productos?${params.toString()}`, { scroll: false });
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, router, searchParams]);

  return (
    <div className="mb-8 flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="BUSCAR PRODUCTO POR NOMBRE..." 
          className="w-full bg-white border border-slate-200 py-5 px-12 rounded-3xl text-[11px] font-black tracking-[0.2em] uppercase focus:border-black outline-none transition-all shadow-sm"
        />
        {busqueda && (
          <button 
            onClick={() => setBusqueda("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <button className="px-8 rounded-3xl flex items-center gap-3 border border-slate-200 bg-white text-slate-500 hover:border-black transition-all">
        <SlidersHorizontal size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest">Filtros</span>
      </button>
    </div>
  );
}