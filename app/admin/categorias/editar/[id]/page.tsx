import { db } from "@/src/lib/db";
import { updateCategoria } from "../../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Save, 
  X, 
  ChevronDown, 
  Settings2, 
  Database 
} from "lucide-react";

/**
 * --- CONFIGURACIÓN ANTI-CACHEO ---
 * Obligamos a que la página de edición siempre obtenga los datos
 * más recientes de la base de datos al cargar.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarCategoria({ params }: PageProps) {
  const { id } = await params;

  // Obtenemos la categoría directamente de la DB
  const result = await db.execute({
    sql: "SELECT * FROM categoria WHERE id_categoria = ?",
    args: [id],
  });

  const categoria = result.rows[0];

  // Si no existe, volvemos al listado
  if (!categoria) {
    redirect("/admin/categorias");
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* BOTÓN VOLVER */}
        <Link 
          href="/admin/categorias" 
          className="inline-flex items-center gap-2 mb-12 group"
        >
          <div className="border-2 border-black p-1 group-hover:bg-black group-hover:text-white transition-all">
            <ArrowLeft size={16} strokeWidth={3} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Regresar al Listado</span>
        </Link>

        {/* ENCABEZADO */}
        <header className="mb-12 border-b-4 border-black pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black text-white p-2">
              <Settings2 size={20} />
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
              Modo Edición // ID {id}
            </h1>
          </div>
          <p className="text-4xl font-black uppercase tracking-tighter italic">
            Actualizar <span className="text-slate-300 italic">Registro</span>
          </p>
        </header>

        {/* FORMULARIO */}
        <form 
          action={updateCategoria} 
          className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          {/* ID OCULTO */}
          <input type="hidden" name="id" value={id} />

          {/* CAMPO: NOMBRE */}
          <div className="p-8 border-b-4 border-black">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">
              Nombre de la Categoría
            </label>
            <div className="relative">
              <input
                name="nombre"
                type="text"
                defaultValue={String(categoria.nombre)}
                placeholder="EJ: JEANS CARGO"
                className="w-full bg-transparent text-2xl font-black uppercase outline-none placeholder:text-slate-200 text-black tracking-tight"
                required
              />
              <div className="absolute -bottom-2 left-0 w-12 h-1 bg-black" />
            </div>
          </div>

          {/* CAMPO: GÉNERO */}
          <div className="p-8 border-b-4 border-black relative group">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">
              Segmento de Mercado
            </label>
            <div className="relative flex items-center">
              <select
                name="genero"
                defaultValue={String(categoria.genero)}
                className="w-full bg-transparent text-sm font-black uppercase tracking-[0.2em] outline-none cursor-pointer appearance-none pr-10 z-10"
              >
                <option value="Unisex">Unisex</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
              </select>
              <div className="absolute right-0 pointer-events-none">
                <ChevronDown size={20} strokeWidth={3} className="text-black" />
              </div>
            </div>
          </div>

          {/* BOTONERA */}
          <div className="flex flex-col sm:flex-row divide-y-4 sm:divide-y-0 sm:divide-x-4 divide-black">
            <button
              type="submit"
              className="flex-1 bg-black text-white p-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
            >
              <Save size={18} className="group-hover:scale-110 transition-transform" />
              Guardar Cambios
            </button>
            <Link
              href="/admin/categorias"
              className="flex-1 bg-white text-black p-6 text-xs font-black uppercase tracking-[0.3em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform" />
              Descartar
            </Link>
          </div>
        </form>

        {/* NOTA TÉCNICA */}
        <div className="mt-12 flex items-center gap-4 text-slate-300">
          <Database size={14} />
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">
            Sincronización directa con Turso DB // Matt Bolivia 2026
          </p>
        </div>
      </div>
    </div>
  );
}