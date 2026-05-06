import { db } from "@/src/lib/db";
import { addCategoria } from "./actions";
import Link from "next/link";
import BotonEliminar from "./BotonEliminar";
import { 
  Plus, 
  Tag, 
  Layers, 
  ArrowRight, 
  Edit2,
  LayoutDashboard,
  ChevronRight,
  ChevronDown
} from "lucide-react";

/**
 * --- CONFIGURACIÓN ANTI-CACHEO ---
 * Esto garantiza que el listado de categorías siempre consulte a la DB
 * y no muestre datos "viejos" después de una inserción o eliminación.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminCategorias() {
  const { rows } = await db.execute("SELECT * FROM categoria ORDER BY id_categoria DESC");

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* BARRA SUPERIOR DE NAVEGACIÓN */}
        <nav className="flex flex-wrap justify-between items-center gap-4 mb-8 md:mb-12">
          <Link 
            href="/admin" 
            className="group flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-300"
          >
            <LayoutDashboard size={14} className="group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline">Admin</span>
            <ChevronRight size={12} className="hidden sm:inline" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-black">Categorías</span>
          </div>
        </nav>

        {/* ENCABEZADO PRINCIPAL */}
        <header className="relative mb-12 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[4px] md:border-b-[6px] border-black pb-8 md:pb-10">
            <div className="space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-3 bg-black text-white px-3 py-1 md:px-4 md:py-1.5">
                <Tag className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Módulo de Clasificación</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                Control de <br />
                <span className="text-slate-200 not-italic">Categorías</span>
              </h1>
            </div>
            <div className="text-left md:text-right border-l-4 border-black pl-4 md:pl-6">
              <p className="text-3xl md:text-[40px] font-black leading-none mb-1">{rows.length}</p>
              <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Registros en Sistema</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <aside className="lg:col-span-4 space-y-8 order-2 lg:order-1">
            <div className="lg:sticky lg:top-12">
              <div className="flex items-center gap-3 mb-6">
                <Plus size={16} strokeWidth={4} />
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Nueva Entrada</h2>
              </div>
              
              <form action={addCategoria} className="space-y-0 border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-5 md:p-6 border-b-4 border-black">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nombre del Segmento</label>
                  <input 
                    name="nombre" 
                    placeholder="EJ: POLERA, CHAMARRA" 
                    className="w-full bg-transparent text-base md:text-lg font-black uppercase outline-none placeholder:text-slate-300 text-black" 
                    required 
                  />
                </div>

                <div className="p-5 md:p-6 border-b-4 border-black relative group">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Género / Destino</label>
                  <div className="relative flex items-center">
                    <select 
                      name="genero" 
                      className="w-full bg-transparent text-[11px] md:text-sm font-black uppercase tracking-widest outline-none cursor-pointer appearance-none pr-10 z-10"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Hombre">Hombre</option>
                      <option value="Mujer">Mujer</option>
                    </select>
                    <div className="absolute right-0 pointer-events-none">
                      <ChevronDown size={18} strokeWidth={3} className="text-black group-hover:translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-black text-white p-5 md:p-6 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-slate-800 transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
                >
                  Confirmar Registro 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </button>
              </form>
            </div>
          </aside>

          {/* COLUMNA DERECHA: TABLA */}
          <main className="lg:col-span-8 order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <Layers size={16} strokeWidth={3} />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Listado Maestro</h2>
            </div>
            
            <div className="mb-4 md:hidden text-[9px] font-bold text-slate-400 italic">Desliza para ver acciones →</div>
            <div className="border-4 border-black overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse min-w-[500px] md:min-w-full">
                <thead>
                  <tr className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em]">
                    <th className="p-4 md:p-6 border-r border-white/10">Descripción</th>
                    <th className="p-4 md:p-6 border-r border-white/10 text-center">Género</th>
                    <th className="p-4 md:p-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y-4 divide-black">
                  {rows.map((cat) => (
                    <tr key={Number(cat.id_categoria)} className="group hover:bg-slate-50 transition-colors">
                      <td className="p-4 md:p-6 border-r-4 border-black">
                        <span className="font-black text-sm md:text-base uppercase tracking-tighter group-hover:pl-2 transition-all block">
                          {String(cat.nombre)}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 border-r-4 border-black text-center">
                        <span className={`inline-block text-[8px] md:text-[9px] font-black px-3 py-1 md:px-4 md:py-1.5 border-2 border-black uppercase tracking-widest ${
                          cat.genero === 'Hombre' ? 'bg-black text-white' :
                          cat.genero === 'Mujer' ? 'bg-slate-200 text-black' :
                          'bg-white text-black'
                        }`}>
                          {String(cat.genero)}
                        </span>
                      </td>
                      <td className="p-4 md:p-6 bg-slate-50/30">
                        <div className="flex justify-end items-center gap-4 md:gap-6">
                          <Link 
                            href={`/admin/categorias/editar/${cat.id_categoria}`}
                            className="group/link flex items-center gap-1.5 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all"
                          >
                            <Edit2 size={13} />
                            <span className="border-b-2 border-transparent group-hover/link:border-black hidden sm:inline">Editar</span>
                          </Link>
                          <BotonEliminar id={Number(cat.id_categoria)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {rows.length === 0 && (
                <div className="p-20 md:p-32 text-center border-t-4 border-black">
                   <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">
                     Base de datos vacía
                   </p>
                </div>
              )}
            </div>
          </main>
        </div>

        {/* FOOTER TÉCNICO */}
        <footer className="mt-20 md:mt-32 pt-10 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between gap-6 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-300 italic">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <span>Matt Bolivia // Est. 2026</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full hidden md:block" />
            <span className="w-full md:w-auto">La Paz // Bolivia</span>
          </div>
          <span>Secure Admin Terminal v2.0</span>
        </footer>
      </div>
    </div>
  );
}