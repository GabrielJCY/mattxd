"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function BarraHerramientas() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("q") || "");

  // Debounce: Espera 300ms después de que el usuario deja de escribir para buscar
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (busqueda) params.set("q", busqueda);
      else params.delete("q");
      
      router.push(`/admin/productos?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, router, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input 
          type="text" 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="BUSCAR PRODUCTO POR NOMBRE O ID..." 
          className="w-full bg-white border border-slate-200 py-4 px-12 rounded-2xl text-[10px] font-bold tracking-widest uppercase focus:border-black outline-none transition-all shadow-sm"
        />
        {busqueda && (
          <button 
            onClick={() => setBusqueda("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button className="bg-white border border-slate-200 px-6 py-4 md:py-0 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:border-black transition-all group">
        <Filter size={16} className="group-hover:text-black" />
        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-black">Filtros</span>
      </button>
    </div>
  );
}