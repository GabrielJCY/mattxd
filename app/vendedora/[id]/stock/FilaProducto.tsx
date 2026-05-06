"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Package, AlertTriangle } from "lucide-react";

interface FilaProductoProps {
  producto: any;
  modelos: any[];
  isMobile?: boolean;
  sedeId: number;
}

export default function FilaProducto({
  producto,
  modelos,
  isMobile = false,
  sedeId
}: FilaProductoProps) {
  const [abierto, setAbierto] = useState(false);
  const [colorExpandido, setColorExpandido] = useState<string | null>(null);

  // Calcular stock total de este producto en la sede
  const stockSedeTotal = useMemo(() =>
    modelos.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
    , [modelos]);

  // Agrupar variantes por color
  const modelosPorColor = useMemo(() => {
    const grupos: { [key: string]: any[] } = {};
    modelos.forEach(m => {
      const col = m.color.trim().toUpperCase();
      if (!grupos[col]) grupos[col] = [];
      grupos[col].push(m);
    });
    return grupos;
  }, [modelos]);

  // Umbral de alerta para vendedoras (Sedes 2 y 3)
  const umbralAlerta = 6;
  const esBajoStockGeneral = stockSedeTotal < umbralAlerta && stockSedeTotal > 0;
  const sinStock = stockSedeTotal === 0;

  const renderVariantes = () => (
    <div className="p-4 md:p-8 bg-zinc-50 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 italic">
        Selecciona un color para ver disponibilidad por talla
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(modelosPorColor).map(([color, variantes]) => {
          const isExpanded = colorExpandido === color;
          const stockColor = variantes.reduce((acc, v) => acc + (Number(v.cantidad) || 0), 0);
          
          return (
            <div key={color} className="flex flex-col">
              <button
                onClick={() => setColorExpandido(isExpanded ? null : color)}
                className={`flex items-center justify-between p-5 border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
                  isExpanded ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="font-black uppercase italic tracking-tighter text-lg">{color}</span>
                  <span className={`text-[9px] font-bold ${isExpanded ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {stockColor} UNIDADES TOTALES
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 space-y-2 z-10"
                  >
                    {variantes.map((m) => {
                      const esBajoStockTalla = m.cantidad < 3 && m.cantidad > 0;
                      const tallaSinStock = m.cantidad === 0;
                      
                      return (
                        <div 
                          key={m.id_modelo} 
                          className={`border-2 border-black p-4 flex items-center justify-between gap-4 transition-colors ${
                            tallaSinStock ? "bg-zinc-200 opacity-60" : esBajoStockTalla ? "bg-red-50" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-10 h-10 flex items-center justify-center font-black italic text-xs border-2 border-black ${
                              tallaSinStock ? "bg-zinc-400 text-white" : esBajoStockTalla ? "bg-red-600 text-white animate-pulse" : "bg-black text-white"
                            }`}>
                              {m.talla}
                            </span>
                            <div>
                              <p className={`text-[9px] font-black uppercase leading-none ${tallaSinStock ? "text-zinc-500" : esBajoStockTalla ? "text-red-600" : "text-zinc-400"}`}>
                                Stock en Tienda {esBajoStockTalla && " (BAJO)"} {tallaSinStock && " (AGOTADO)"}
                              </p>
                              <p className={`text-sm font-black italic ${tallaSinStock ? "text-zinc-500" : esBajoStockTalla ? "text-red-700" : "text-black"}`}>
                                {m.cantidad} Unidades
                              </p>
                            </div>
                          </div>
                          {esBajoStockTalla && <AlertTriangle size={16} className="text-red-600" />}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 overflow-hidden rounded-2xl">
        <div className="p-5 flex justify-between items-center" onClick={() => setAbierto(!abierto)}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 border-2 border-black flex items-center justify-center ${sinStock ? 'bg-zinc-200' : 'bg-zinc-100'}`}>
              <Package size={18} className={sinStock ? 'text-zinc-400' : 'text-black'} />
            </div>
            <div>
              <p className="font-black text-black uppercase text-[11px] leading-none mb-1">{producto.nombre}</p>
              <span className={`px-2 py-0.5 text-[9px] font-black border-2 border-black ${
                sinStock ? 'bg-zinc-400 text-white' : esBajoStockGeneral ? 'bg-red-500 text-white animate-pulse' : 'bg-black text-white'
              }`}>
                {stockSedeTotal} UNIDS
              </span>
            </div>
          </div>
          <div className="bg-black text-white p-2 border-2 border-black rounded-lg">
            {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
        <AnimatePresence>
          {abierto && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t-[3px] border-black">
              {renderVariantes()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <tr
        className={`border-b-[3px] border-black transition-colors cursor-pointer ${abierto ? 'bg-zinc-50' : 'hover:bg-zinc-100/50'}`}
        onClick={() => setAbierto(!abierto)}
      >
        <td className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 border-[3px] border-black flex items-center justify-center font-black text-lg italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
              {producto.nombre.charAt(0)}
            </div>
            <div>
              <p className="font-black text-black uppercase text-base tracking-tighter leading-none">{producto.nombre}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
                {Object.keys(modelosPorColor).length} Colores en catálogo
              </p>
            </div>
          </div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-5 py-2 border-[3px] border-black font-black text-xs inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            sinStock ? 'bg-zinc-200 text-zinc-500 border-zinc-400' : esBajoStockGeneral ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black'
          }`}>
            {stockSedeTotal} DISPONIBLES
          </span>
        </td>
        <td className="p-6 text-right">
          <button className="bg-black text-white text-[10px] font-black uppercase px-6 py-3 border-b-4 border-r-4 border-zinc-600 active:translate-y-1 active:border-0 transition-all">
            {abierto ? "CERRAR" : "VER TALLAS"}
          </button>
        </td>
      </tr>
      <AnimatePresence>
        {abierto && (
          <tr>
            <td colSpan={3} className="p-0 border-b-[3px] border-black">
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                {renderVariantes()}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}