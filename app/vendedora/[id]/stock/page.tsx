"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Store, Search, ChevronRight, Package } from "lucide-react";
import Image from "next/image";
import { getStockVendedora } from "./actions";
import FilaProducto from "./FilaProducto";

// --- INTERFACES PARA TIPADO SEGURO ---
interface Producto {
  id_producto: number;
  nombre: string;
  imagen_url?: string;
}

interface Modelo {
  id_producto: number;
  cantidad: number;
  [key: string]: any; 
}

interface EstadoData {
  productos: Producto[];
  modelos: Modelo[];
  sedeNombre: string;
  sedeId: number;
}

export default function StockVendedoraPage() {
  const params = useParams();
  
  // Validación de ID de ruta
  const idVendedora = Array.isArray(params.id) 
    ? params.id[0] 
    : params.id ?? "";

  const [view, setView] = useState<"genero" | "galeria" | "detalle">("genero");
  const [generoSeleccionado, setGeneroSeleccionado] = useState<string>("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estado con el tipo de la interfaz definida arriba
  const [data, setData] = useState<EstadoData | null>(null);

  const cargarDatos = async (genero: string) => {
    setLoading(true);
    const res = await getStockVendedora(idVendedora, genero);
    
    if (res.success) {
      setData({
        productos: res.productos || [],
        modelos: res.modelos || [],
        // SOLUCIÓN AL ERROR 2322: Forzamos la conversión a string 
        // para neutralizar el tipo (string | number | bigint | ArrayBuffer)
        sedeNombre: String(res.sedeNombre || ""),
        sedeId: Number(res.sedeId || 0)
      });
      setGeneroSeleccionado(genero);
      setView("galeria");
    }
    setLoading(false);
  };

  const productosFiltrados = data?.productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-black" size={48} />
      <div className="text-2xl font-black uppercase italic tracking-tighter text-black">
        Actualizando Inventario...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-black selection:text-white">
      
      {/* HEADER DINÁMICO */}
      <header className="p-6 md:p-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Store size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              {view === "genero" ? "MATT BOLIVIA" : `Sede: ${data?.sedeNombre}`}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-slate-950">
            {view === "genero" ? (
              <>Control de <br /> <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">Inventario</span></>
            ) : view === "galeria" ? (
              <>{generoSeleccionado} <br /> <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">Catálogo</span></>
            ) : (
              <>{productoSeleccionado?.nombre} <br /> <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">Disponibilidad</span></>
            )}
          </h2>
        </motion.div>

        <div className="flex gap-3">
          <button 
            onClick={() => {
              if (view === "detalle") setView("galeria");
              else if (view === "galeria") setView("genero");
              else window.location.href = `/vendedora/${idVendedora}`;
            }}
            className="bg-black text-white px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
          >
            <ArrowLeft size={14} strokeWidth={3} /> {view === "genero" ? "Panel Principal" : "Atrás"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:px-10">
        <AnimatePresence mode="wait">
          
          {/* VISTA 1: GÉNERO */}
          {view === "genero" && (
            <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div onClick={() => cargarDatos("hombre")} className="group cursor-pointer relative h-[450px] overflow-hidden rounded-[3rem] border-[4px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                <Image src="/hombre.png" alt="Hombre" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <span className="absolute bottom-10 left-10 text-6xl font-black uppercase italic text-white z-10">Hombre</span>
              </div>
              <div onClick={() => cargarDatos("mujer")} className="group cursor-pointer relative h-[450px] overflow-hidden rounded-[3rem] border-[4px] border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                <Image src="/mujer.png" alt="Mujer" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                <span className="absolute bottom-10 left-10 text-6xl font-black uppercase italic text-white z-10">Mujer</span>
              </div>
            </motion.div>
          )}

          {/* VISTA 2: GALERÍA VISUAL */}
          {view === "galeria" && (
            <motion.div key="gal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
              <div className="relative max-w-2xl mx-auto px-2">
                <input
                  type="text"
                  placeholder="FILTRAR POR NOMBRE..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-white border-[4px] border-black p-6 pl-16 font-black uppercase text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-yellow-50 transition-colors"
                />
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-black" size={24} strokeWidth={3} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 pb-10">
                {productosFiltrados.map((prod) => {
                  const stockTotal = data?.modelos
                    .filter(m => m.id_producto === prod.id_producto)
                    .reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0) || 0;
                  
                  return (
                    <div 
                      key={prod.id_producto} 
                      onClick={() => { setProductoSeleccionado(prod); setView("detalle"); }} 
                      className="group cursor-pointer bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-2xl active:translate-y-1 transition-all"
                    >
                      <div className="relative aspect-[3/4] bg-zinc-100 border-b-[3px] border-black overflow-hidden">
                        <Image src={prod.imagen_url || "/placeholder-producto.png"} alt={prod.nombre} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        {stockTotal === 0 && ( 
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-red-600 text-white font-black px-3 py-1 text-[10px] uppercase -rotate-12 border-2 border-white">AGOTADO</span>
                          </div> 
                        )}
                      </div>
                      <div className="p-4">
                        <p className="font-black text-[11px] md:text-[13px] uppercase truncate italic leading-none mb-2">{prod.nombre}</p>
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-black px-2 py-1 border-2 border-black ${stockTotal < 5 && stockTotal > 0 ? 'bg-orange-500 text-white animate-pulse' : stockTotal === 0 ? 'bg-zinc-200 text-zinc-500' : 'bg-black text-white'}`}>
                            {stockTotal} DISPONIBLES
                          </span>
                          <ChevronRight size={18} strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* VISTA 3: DETALLE */}
          {view === "detalle" && productoSeleccionado && (
            <motion.div key="det" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto pb-20 px-2">
              <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-[2.5rem]">
                <div className="p-8 bg-black text-white flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 italic">Stock en Tiempo Real</p>
                    <h3 className="text-3xl md:text-5xl font-black uppercase italic leading-none">{productoSeleccionado.nombre}</h3>
                  </div>
                  <Package size={32} className="hidden md:block" />
                </div>
                <div className="border-t-[4px] border-black">
                   <FilaProducto 
                      producto={productoSeleccionado} 
                      modelos={data?.modelos.filter(m => m.id_producto === productoSeleccionado.id_producto) || []} 
                      sedeId={data?.sedeId || 0}
                      isMobile={true} 
                   />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-10 border-t border-slate-200 pt-8 pb-10 opacity-30 italic text-center px-10">
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Matt Bolivia - Terminal de Venta Local</p>
      </footer>
    </div>
  );
}