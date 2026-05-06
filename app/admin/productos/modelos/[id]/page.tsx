/**
 * --- CONFIGURACIÓN DE RENDERIZADO DINÁMICO ---
 * force-dynamic: Evita que Next.js genere una versión estática de la página.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import { addModelo, deleteModelo, updateModelo, uploadImagenProducto, deleteImagen } from "./actions";
import Link from "next/link";
import BotonActualizar from "./BotonActualizar";
import InputImagen from "./InputImagen";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Layers,
  Palette
} from "lucide-react";

export default async function ModelosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Obtención de datos del producto
  const resProd = await db.execute({
    sql: "SELECT nombre FROM producto WHERE id_producto = ?",
    args: [id],
  });
  const producto = resProd.rows[0];

  // 2. Obtención de variantes y stock (sucursal 4)
  const { rows: variantesRaw } = await db.execute({
    sql: `
      SELECT 
        m.id_modelo, 
        m.id_producto, 
        m.talla, 
        m.color, 
        m.precio, 
        SUM(COALESCE(s.cantidad, 0)) as cantidad
      FROM modelo m
      LEFT JOIN stock s ON m.id_modelo = s.id_modelo AND s.id_sucursal = 4
      WHERE m.id_producto = ?
      GROUP BY m.id_modelo
      ORDER BY m.color ASC, m.talla ASC
    `,
    args: [id],
  });

  // --- LÓGICA DE AGRUPACIÓN POR COLOR ---
  const variantesPorColor = variantesRaw.reduce((acc: any, curr: any) => {
    const colorKey = String(curr.color).toUpperCase().trim();
    if (!acc[colorKey]) acc[colorKey] = [];
    acc[colorKey].push(curr);
    return acc;
  }, {});

  // 3. Obtención de galería de imágenes
  const { rows: imagenes } = await db.execute({
    sql: "SELECT * FROM imagen_producto WHERE id_producto = ?",
    args: [id],
  });

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* ENCABEZADO */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-4 border-black pb-8">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/admin/productos" className="border-2 border-black p-2 md:p-3 hover:bg-black hover:text-white transition-all">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
            </Link>
            <div>
              <h1 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 mb-1">Consola de Control / Activo #{id}</h1>
              <p className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic underline decoration-black/10 underline-offset-4 md:underline-offset-8">
                {String(producto?.nombre)}
              </p>
            </div>
          </div>
          <div className="text-left md:text-right font-black uppercase italic text-[10px] md:text-[11px] tracking-widest opacity-60">
            Matt Bolivia<br/>Gestión de Inventario
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-16">
          {/* SECCIÓN: NUEVA VARIANTE */}
          <div className="lg:col-span-2 border-2 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-4 h-4 md:w-5 md:h-5" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em]">Registrar Nueva Variante</h2>
            </div>
            
            <form action={async (formData) => { "use server"; await addModelo(formData); }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="hidden" name="id_producto" value={id} />
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Talla / Medida</label>
                <input name="talla" placeholder="EJ: 42" className="w-full border-b-2 border-black py-2 font-bold uppercase outline-none focus:bg-slate-50 transition-colors" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Color / Acabado</label>
                <input name="color" placeholder="EJ: NEGRO" className="w-full border-b-2 border-black py-2 font-bold uppercase outline-none focus:bg-slate-50 transition-colors" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Precio (BS)</label>
                <input name="precio" type="number" step="0.01" placeholder="0.00" className="w-full border-b-2 border-black py-2 font-black text-xl outline-none focus:bg-slate-50 transition-colors" required />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stock Inicial (Almacén)</label>
                <input name="cantidad" type="number" placeholder="0" className="w-full border-b-2 border-black py-2 font-bold outline-none focus:bg-slate-50 transition-colors" required />
              </div>
              <button type="submit" className="md:col-span-2 bg-black text-white py-5 font-black uppercase text-[11px] tracking-[0.4em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                Crear Variante <Plus className="w-4 h-4" strokeWidth={3} />
              </button>
            </form>
          </div>

          {/* SECCIÓN: SUBIDA DE IMAGEN */}
          <div className="border-2 border-black p-6 md:p-8 bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-8 text-white">
              <ImageIcon className="w-4 h-4 md:w-5 md:h-5" />
              <h2 className="text-xs font-black uppercase tracking-[0.3em]">Carga de Medios</h2>
            </div>
            <form action={async (formData) => { "use server"; await uploadImagenProducto(formData); }} className="space-y-6">
              <input type="hidden" name="id_producto" value={id} />
              <div className="bg-white/10 p-4 border border-white/20">
                <InputImagen id_producto={id} />
              </div>
            </form>
          </div>
        </div>

        {/* LISTADO DE VARIANTES AGRUPADAS POR COLOR */}
        <div className="space-y-12 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5" />
            <h2 className="text-sm font-black uppercase tracking-[0.4em]">Inventario por Colores</h2>
          </div>

          {Object.keys(variantesPorColor).length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 py-20 text-center uppercase font-black text-slate-300 tracking-widest text-xs">
              Sin variantes registradas
            </div>
          ) : (
            Object.keys(variantesPorColor).map((color) => (
              <div key={color} className="border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* CABECERA DEL COLOR */}
                <div className="bg-black text-white p-4 md:px-6 flex justify-between items-center">
                  <h3 className="font-black italic uppercase tracking-widest flex items-center gap-3">
                    <span className="bg-white text-black px-3 py-0.5 text-xs not-italic">COLOR:</span>
                    <span className="text-lg md:text-xl">{color}</span>
                  </h3>
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                    {variantesPorColor[color].length} Variantes de Talla
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest border-b-2 border-black">
                        <th className="p-4 w-24 text-center border-r border-black/10">Talla</th>
                        <th className="p-4 w-32 border-r border-black/10">Precio (Bs)</th>
                        <th className="p-4 border-r border-black/10">Gestión de Stock (Almacén 4)</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {variantesPorColor[color].map((v: any) => (
                        <tr key={String(v.id_modelo)} className="group hover:bg-slate-50 transition-colors">
                          {/* TALLA */}
                          <td className="p-2 border-r border-slate-100 text-center">
                            <form id={`edit-form-${v.id_modelo}`} action={async (formData) => { "use server"; await updateModelo(formData); }}>
                              <input type="hidden" name="id_modelo" value={String(v.id_modelo)} />
                              <input type="hidden" name="id_producto" value={id} />
                              <input type="hidden" name="color" value={String(v.color)} />
                              <input 
                                name="talla" 
                                defaultValue={String(v.talla)} 
                                className="w-14 h-10 text-center font-black text-sm bg-transparent border-2 border-transparent hover:border-slate-200 focus:border-black focus:bg-white outline-none rounded uppercase transition-all"
                              />
                            </form>
                          </td>

                          {/* PRECIO */}
                          <td className="p-2 border-r border-slate-100">
                            <input 
                              form={`edit-form-${v.id_modelo}`} 
                              name="precio" 
                              type="number" 
                              step="0.01" 
                              defaultValue={Number(v.precio)} 
                              className="w-full py-2 px-3 font-bold text-sm bg-transparent outline-none focus:underline decoration-2"
                            />
                          </td>

                          {/* STOCK */}
                          <td className="p-2 border-r border-slate-100 bg-slate-50/30">
                            <div className="flex items-center gap-4 px-3">
                              <div className="flex flex-col min-w-[80px]">
                                <span className={`text-[11px] font-black leading-none ${Number(v.cantidad) <= 0 ? 'text-red-500' : 'text-black'}`}>
                                  {Number(v.cantidad || 0)} DISP.
                                </span>
                                <span className="text-[7px] uppercase font-bold text-slate-400 mt-1">STOCK ACTUAL</span>
                              </div>
                              <div className="relative flex-1 max-w-[140px]">
                                <input 
                                  form={`edit-form-${v.id_modelo}`} 
                                  name="cantidad" 
                                  type="number"
                                  defaultValue={0} 
                                  placeholder="+ / -"
                                  className={`w-full pl-3 pr-8 py-2 border-2 border-black font-black text-xs outline-none transition-all ${Number(v.cantidad) <= 0 ? 'bg-red-50' : 'bg-white'}`}
                                />
                                <Plus className="absolute right-2 top-2.5 w-3 h-3 opacity-20" />
                              </div>
                            </div>
                          </td>

                          {/* ACCIONES */}
                          <td className="p-2 text-right pr-4">
                            <div className="flex justify-end items-center gap-3 md:gap-4">
                              <BotonActualizar formId={`edit-form-${v.id_modelo}`} />
                              <div className="w-[1px] h-4 bg-slate-200" />
                              <form action={async () => { "use server"; await deleteModelo(Number(v.id_modelo), id); }}>
                                <button className="text-slate-300 hover:text-red-600 transition-all">
                                  <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* GALERÍA DE FOTOS */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-4 w-1 bg-black"></div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em]">Galería de Fotos</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imagenes.map((img: any) => (
              <div key={img.id_imagen} className="relative group border-2 border-black aspect-[3/4] overflow-hidden">
                <img src={img.url_imagen} alt="Producto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <form action={async () => { "use server"; await deleteImagen(img.id_imagen, id); }}>
                    <button className="bg-white text-black p-4 hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)]">
                      <Trash2 className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center py-12 border-t border-black mt-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
            Matt Bolivia // Terminal de Gestión de Inventarios // 2026
          </p>
        </footer>
      </div>
    </div>
  );
}