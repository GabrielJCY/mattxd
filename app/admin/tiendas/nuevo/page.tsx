/**
 * --- CONFIGURACIÓN DE RENDERIZADO DINÁMICO ---
 * force-dynamic: Asegura que Next.js trate esta página como dinámica.
 * Esto evita que el formulario se quede "congelado" en una versión estática de build.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { TiendaForm } from "../tienda-form";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function NuevaTiendaPage() {
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-12 selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* BOTÓN VOLVER - Ajuste de margen en móvil */}
      <Link 
        href="/admin/tiendas" 
        className="inline-flex items-center gap-3 group mb-10 md:mb-16"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors">
          Regresar al listado
        </span>
      </Link>

      <div className="max-w-5xl mx-auto">
        {/* HEADER DE ALTO IMPACTO - Tipografía responsiva */}
        <header className="relative mb-12 md:mb-20">
          {/* Texto vertical oculto en móvil por espacio */}
          <div className="absolute -left-12 top-0 hidden lg:block">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] [writing-mode:vertical-rl] text-zinc-200 rotate-180">
              New_Registration_Form
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="w-8 md:w-12 h-[2px] bg-black"></div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-400">
              Sedes / Infraestructura
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter italic leading-[0.9] md:leading-[0.8] mb-6 md:mb-8">
            Añadir <br />
            <span className="text-white drop-shadow-[1.5px_1.5px_0_#000,-1.5px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_1.5px_0_#000] md:drop-shadow-[2px_2px_0_#000,-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000]">Sucursal</span>
          </h1>

          <p className="max-w-md text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-zinc-500 leading-relaxed">
            Configure los parámetros operativos, ubicación geográfica y fachada visual del nuevo punto de venta Matt Bolivia.
          </p>
        </header>

        {/* CONTENEDOR DEL FORMULARIO - Padding reducido en móvil */}
        <section className="relative">
          {/* Decoración reducida en móvil */}
          <div className="absolute top-0 right-0 w-12 h-12 md:w-20 md:h-20 border-t-2 border-r-2 border-black rounded-tr-[2rem] md:rounded-tr-[3rem] pointer-events-none opacity-10"></div>
          
          <div className="bg-[#F8F9FA] border border-zinc-100 p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-[20px_20px_40px_#e5e5e5,-20px_-20px_40px_#ffffff] md:shadow-[30px_30px_60px_#e5e5e5,-30px_-30px_60px_#ffffff]">
            <TiendaForm />
          </div>

          {/* Etiqueta técnica inferior - Stacked en móvil muy pequeño */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 px-2 md:px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-400">Ready to sync with DB_Server</span>
              </div>
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-200">Matt_Retail_Control</span>
          </div>
        </section>
      </div>

      {/* ELEMENTO DECORATIVO DE FONDO */}
      <div className="fixed bottom-[-2%] left-[-5%] text-[8rem] md:text-[20rem] font-black italic text-zinc-50 opacity-[0.05] md:opacity-[0.03] pointer-events-none select-none uppercase">
        Create
      </div>
    </div>
  );
}