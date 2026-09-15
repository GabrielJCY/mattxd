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
      <Loader2 className="animate-spin text-black" size={40} />
      <div className="text-lg md:text-xl font-black uppercase tracking-widest text-black">
        Actualizando Inventario...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-16">
      
      {/* HEADER DINÁMICO */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 md:px-12 py-4 md:py-6 max-w-7xl mx-auto flex flex-row justify-between items-center gap-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-0.5">
            <Store size={12} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">
              {view === "genero" ? "MATT BOLIVIA" : `SEDE: ${data?.sedeNombre}`}
            </span>
          </div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight text-black">
            {view === "genero" ? (
              "Control de Inventario"
            ) : view === "galeria" ? (
              `${generoSeleccionado} / Catálogo`
            ) : (
              "Disponibilidad"
            )}
          </h2>
        </motion.div>

        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (view === "detalle") setView("galeria");
              else if (view === "galeria") setView("genero");
              else window.location.href = `/vendedora/${idVendedora}`;
            }}
            className="bg-black text-white px-4 md:px-5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft size={14} strokeWidth={2.5} /> 
            <span className="hidden sm:inline">{view === "genero" ? "Panel Principal" : "Atrás"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-12 pt-6 md:pt-10">
        <AnimatePresence mode="wait">
          
          {/* VISTA 1: GÉNERO */}
          {view === "genero" && (
            <motion.div 
              key="gen" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto"
            >
              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => cargarDatos("hombre")} 
                className="group cursor-pointer relative h-[360px] md:h-[480px] overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-end p-6 md:p-8"
              >
                <Image src="/hombre1.png" alt="Hombre" fill className="object-cover grayscale group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative z-10 flex justify-between items-end">
                  <span className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">Hombre</span>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileTap={{ scale: 0.98 }}
                onClick={() => cargarDatos("mujer")} 
                className="group cursor-pointer relative h-[360px] md:h-[480px] overflow-hidden rounded-3xl bg-zinc-100 border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-end p-6 md:p-8"
              >
                <Image src="/mujer2.png" alt="Mujer" fill className="object-cover grayscale group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative z-10 flex justify-between items-end">
                  <span className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white">Mujer</span>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ChevronRight size={20} strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* VISTA 2: GALERÍA VISUAL */}
          {view === "galeria" && (
            <motion.div 
              key="gal" 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.3 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  placeholder="BUSCAR PRODUCTO..."
                  value={busqueda}
                  onChange={(e) => {
                    // Permitir únicamente letras (incluyendo acentos y eñes) y espacios
                    const valorLimpio = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
                    setBusqueda(valorLimpio);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 font-black uppercase text-xs md:text-sm text-black placeholder:text-zinc-400 focus:bg-white focus:border-black outline-none transition-all shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} strokeWidth={2.5} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 pb-10">
                {productosFiltrados.map((prod, index) => {
                  const stockTotal = data?.modelos
                    .filter(m => m.id_producto === prod.id_producto)
                    .reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0) || 0;
                  
                  return (
                    <motion.div 
                      key={prod.id_producto} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setProductoSeleccionado(prod); setView("detalle"); }} 
                      className="group cursor-pointer bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:border-black transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                        <Image src={prod.imagen_url || "/placeholder-producto.png"} alt={prod.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        {stockTotal === 0 && ( 
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center p-2">
                            <span className="bg-black text-white font-black px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-md">Agotado</span>
                          </div> 
                        )}
                      </div>
                      <div className="p-3 md:p-4 flex flex-col gap-2">
                        <p className="font-black text-[11px] md:text-[12px] uppercase truncate text-black">{prod.nombre}</p>
                        <div className="flex justify-between items-center pt-1 border-t border-zinc-100">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${stockTotal < 5 && stockTotal > 0 ? 'bg-zinc-100 text-black border border-black/20' : stockTotal === 0 ? 'text-zinc-400' : 'text-black'}`}>
                            {stockTotal} disp.
                          </span>
                          <span className="text-xs font-bold text-zinc-400 group-hover:text-black transition-colors">→</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* VISTA 3: DETALLE */}
          {view === "detalle" && productoSeleccionado && (
            <motion.div 
              key="det" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto pb-20"
            >
              <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 md:p-8 bg-zinc-900 text-white flex justify-between items-center">
                  <div className="flex-1 pr-4">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Stock en Tiempo Real</p>
                    <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">{productoSeleccionado.nombre}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0">
                    <Package size={20} />
                  </div>
                </div>
                <div className="p-1">
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

      <footer className="mt-12 border-t border-zinc-100 pt-6 pb-8 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400">Matt Bolivia — Terminal de Venta Local</p>
      </footer>
    </div>
  );
}