/**
 * --- CONFIGURACIÓN DE RENDERIZADO ---
 * force-dynamic: Obliga a Next.js a renderizar la página en cada solicitud,
 * evitando que los datos del producto se queden "congelados" en el caché.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import { updateProducto } from "../../actions";
import Link from "next/link";
import { redirect } from "next/navigation";
import BotonCloudinary from "@/components/BotonCloudinary";
import { 
  ArrowLeft, 
  Edit3, 
  Package, 
  Layout, 
  AlignLeft,
  ChevronDown,
  Info,
  Ruler
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Buscamos los datos del producto actual (Consulta en tiempo real)
  const resProd = await db.execute({
    sql: "SELECT * FROM producto WHERE id_producto = ?",
    args: [id],
  });
  const producto = resProd.rows[0];

  // 2. Traemos todas las categorías actualizadas
  const resCat = await db.execute("SELECT * FROM categoria ORDER BY nombre ASC");
  const categorias = resCat.rows;

  // Si el producto no existe, volvemos a la lista
  if (!producto) {
    redirect("/admin/productos");
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 md:py-20">
        
        {/* NAVEGACIÓN */}
        <nav className="mb-10 md:mb-16">
          <Link 
            href="/admin/productos" 
            className="inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-black hover:underline transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Inventario
          </Link>
        </nav>

        {/* CABECERA */}
        <header className="mb-10 md:mb-12 space-y-2">
          <div className="flex items-center gap-2 text-black">
            <Edit3 size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Asset Modification</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-black leading-none">
            Editar <span className="underline decoration-1 underline-offset-4 md:underline-offset-8">#{id}</span>
          </h1>
          <div className="h-[2px] w-full bg-black mt-4 md:mt-6" />
        </header>

        {/* FORMULARIO */}
        <form 
          action={async (formData: FormData) => {
            "use server";
            await updateProducto(formData);
          }}
          className="space-y-8 md:space-y-12"
        >
          {/* ID Oculto */}
          <input type="hidden" name="id" value={id} />

          {/* CAMPO: NOMBRE */}
          <div className="space-y-3 md:space-y-4">
            <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-black italic">
              <Layout size={14} /> Designación del Ítem
            </label>
            <input
              name="nombre"
              type="text"
              defaultValue={String(producto.nombre)}
              required
              className="w-full bg-white border-2 border-black p-3 md:p-4 text-base md:text-lg font-black uppercase tracking-tight outline-none focus:bg-black focus:text-white transition-all text-black placeholder:text-black/20"
            />
          </div>

          {/* CAMPO: CATEGORÍA */}
          <div className="space-y-3 md:space-y-4">
            <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-black italic">
              <Package size={14} /> Categoría de Sistema
            </label>
            <div className="relative">
              <select
                name="id_categoria"
                defaultValue={Number(producto.id_categoria)}
                required
                className="w-full bg-white border-2 border-black p-3 md:p-4 text-sm md:text-lg font-black uppercase tracking-tight outline-none appearance-none cursor-pointer focus:bg-black focus:text-white transition-all text-black"
              >
                {categorias.map((cat: any) => (
                  <option key={Number(cat.id_categoria)} value={Number(cat.id_categoria)} className="bg-white text-black">
                    {String(cat.nombre).toUpperCase()} — {String(cat.genero).toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none" />
            </div>
          </div>

          {/* CAMPO: TABLA DE MEDIDAS (Cloudinary) */}
          <div className="space-y-3 md:space-y-4">
             <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-black italic">
               <Ruler size={14} /> Guía de Medidas (Multimedia)
             </label>
             <BotonCloudinary 
               initialUrl={String(producto.tabla_medidas_url || "")} 
             />
          </div>

          {/* CAMPO: DESCRIPCIÓN */}
          <div className="space-y-3 md:space-y-4">
            <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-black italic">
              <AlignLeft size={14} /> Especificaciones Técnicas
            </label>
            <textarea
              name="descripcion"
              defaultValue={String(producto.descripcion || "")}
              rows={4}
              placeholder="DETALLES TÉCNICOS..."
              className="w-full bg-white border-2 border-black p-3 md:p-4 text-sm md:text-base font-bold uppercase tracking-tight outline-none resize-none focus:bg-black focus:text-white transition-all text-black placeholder:text-black/20"
            />
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col gap-3 md:gap-4 pt-6 md:pt-10">
            <button
              type="submit"
              className="w-full bg-black text-white py-5 md:py-6 text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] hover:invert transition-all active:scale-[0.98] border-2 border-black"
            >
              Actualizar Registro
            </button>
            
            <Link
              href="/admin/productos"
              className="w-full bg-white text-black py-5 md:py-6 text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] hover:bg-black hover:text-white transition-all text-center flex items-center justify-center border-2 border-black"
            >
              Cancelar
            </Link>
          </div>
        </form>

        {/* NOTA INFORMATIVA */}
        <div className="mt-12 md:mt-20 p-6 md:p-8 border-2 border-black flex items-start gap-3 md:gap-4">
           <Info size={18} className="text-black flex-shrink-0 mt-0.5" />
           <p className="text-[8px] md:text-[10px] font-black text-black uppercase leading-relaxed tracking-[0.1em] md:tracking-[0.2em]">
             AVISO: LOS CAMBIOS SE REFLEJARÁN INSTANTÁNEAMENTE EN EL CATÁLOGO PÚBLICO DE MATT BOLIVIA TRAS LA CONFIRMACIÓN.
           </p>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 md:mt-32 pt-8 md:pt-10 border-t-2 border-black">
          <p className="text-[8px] md:text-[10px] font-black text-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-center leading-loose">
            Matt Bolivia // Product Management Terminal
          </p>
        </footer>

      </div>
    </div>
  );
}