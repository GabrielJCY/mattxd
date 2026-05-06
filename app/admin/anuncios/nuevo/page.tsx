import { db } from "@/src/lib/db";
import FormularioAnuncio from "./FormularioAnuncio";
import { crearAnuncio } from "../actions"; 
import { ChevronLeft, PlusSquare, Terminal, AlertCircle } from "lucide-react";
import Link from "next/link";

// Forzamos que la página sea dinámica
export const dynamic = "force-dynamic";

export default async function NuevoAnuncioPage() {
  let productos = [];
  let errorDb = false;

  try {
    const res = await db.execute("SELECT id_producto, nombre FROM producto ORDER BY nombre ASC");
    productos = JSON.parse(JSON.stringify(res.rows));
  } catch (error) {
    console.error("Error cargando productos:", error);
    errorDb = true;
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white p-4 md:p-12 flex flex-col items-center overflow-x-hidden">
      
      {/* NAVEGACIÓN DE COMANDO - Adaptada para móvil */}
      <div className="w-full max-w-2xl mb-8 md:mb-12 flex justify-start">
        <Link 
          href="/admin/anuncios" 
          className="group flex items-center gap-3 border-[3px] md:border-4 border-black px-4 md:px-6 py-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-1"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Volver al Panel</span>
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        {/* CABECERA EDITORIAL - Tipografía fluida */}
        <header className="mb-10 md:mb-16 border-b-[4px] md:border-b-[6px] border-black pb-8 md:pb-10 relative">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="bg-black text-white p-1.5 md:p-2 border-2 border-black">
              <PlusSquare className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </div>
            <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400">
              Campaign Deployment // Matt Bolivia
            </h2>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] md:leading-[0.8] text-black">
            New <span className="text-slate-100 not-italic">Ad</span>
          </h1>

          <div className="absolute right-0 bottom-4 hidden md:flex items-center gap-2 text-slate-200">
            <Terminal size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">System_Ready_v3</span>
          </div>
        </header>

        {/* MANEJO DE ERROR DE BASE DE DATOS */}
        {errorDb && (
          <div className="mb-8 md:mb-10 border-[3px] md:border-4 border-red-500 bg-red-50 p-4 md:p-6 flex items-start gap-3 md:gap-4 shadow-[6px_6px_0px_0px_rgba(239,68,68,1)] md:shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <AlertCircle className="text-red-600 mt-1 w-5 h-5" strokeWidth={3} />
            <div>
              <p className="font-black uppercase italic text-xs md:text-sm text-red-600 tracking-tight">Error de Conexión Crítico</p>
              <p className="text-[9px] md:text-[10px] font-bold text-red-400 uppercase leading-relaxed mt-1">
                No se pudieron recuperar los productos. El formulario podría no funcionar correctamente.
              </p>
            </div>
          </div>
        )}

        {/* CONTENEDOR DEL FORMULARIO - Sombras y paddings responsivos */}
        <div className="bg-white border-[3px] md:border-4 border-black p-6 md:p-12 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] mb-16 md:20 relative">
          {/* Indicador visual */}
          <div className="absolute -top-1 -left-1 bg-black text-white px-3 py-1 text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
            Input Mode
          </div>

          <FormularioAnuncio 
            productos={productos} 
            action={crearAnuncio} 
          />
        </div>

        {/* FOOTER TÉCNICO - Ajuste para móvil */}
        <footer className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-300 italic border-t-2 border-slate-100 pt-6 md:pt-8 mb-8 text-center sm:text-left">
          <span>Matt Bolivia Admin Portal</span>
          <span className="hidden sm:inline">|</span>
          <span>Deploy_Key: 2026_AD_GEN</span>
        </footer>
      </div>
    </div>
  );
}