"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Package, Send, Check } from "lucide-react";
import { asignarStock } from "./actions";

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
  const [cargando, setCargando] = useState<number | null>(null);
  const [colorExpandido, setColorExpandido] = useState<string | null>(null);

  const stockSedeTotal = useMemo(() =>
    modelos.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0)
    , [modelos]);

  const modelosPorColor = useMemo(() => {
    const grupos: { [key: string]: any[] } = {};
    modelos.forEach(m => {
      const col = m.color.trim().toUpperCase();
      if (!grupos[col]) grupos[col] = [];
      grupos[col].push(m);
    });
    return grupos;
  }, [modelos]);

  // Umbral general para la fila superior
  const umbralAlerta = sedeId === 4 ? 8 : 6;
  const esBajoStockGeneral = stockSedeTotal < umbralAlerta;
  const esAlmacen = sedeId === 4;

  const handleTransferir = async (id_modelo: number, sucursalDestino: number) => {
    const cant = window.prompt("¿CUÁNTAS UNIDADES DESEAS ENVIAR?");
    if (!cant || isNaN(Number(cant)) || Number(cant) <= 0) return;

    setCargando(id_modelo);
    const res = await asignarStock(id_modelo, sucursalDestino, Number(cant));

    if (res.success) {
      alert("ENVÍO REALIZADO CON ÉXITO");
    } else {
      alert("ERROR: " + res.error);
    }
    setCargando(null);
  };

  const renderVariantes = () => (
    <div className="p-4 md:p-8 bg-zinc-50 space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 italic">
        Selecciona un color para gestionar tallas
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(modelosPorColor).map(([color, variantes]) => {
          const isExpanded = colorExpandido === color;
          
          return (
            <div key={color} className="flex flex-col">
              <button
                onClick={() => setColorExpandido(isExpanded ? null : color)}
                className={`flex items-center justify-between p-5 border-[3px] border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
                  isExpanded ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-100"
                }`}
              >
                <span className="font-black uppercase italic tracking-tighter text-lg">{color}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 border-2 ${isExpanded ? 'border-white' : 'border-black opacity-30'}`}>
                    {variantes.length} TALLAS
                  </span>
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
                      // Lógica individual por talla
                      const esBajoStockTalla = m.cantidad < umbralAlerta;
                      
                      return (
                        <div 
                          key={m.id_modelo} 
                          // AQUÍ CAMBIA EL COLOR: si hay poco stock, se pone rojo suave o intenso
                          className={`border-2 border-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            esBajoStockTalla ? "bg-red-50" : "bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-10 h-10 flex items-center justify-center font-black italic text-xs border-2 border-black ${
                              esBajoStockTalla ? "bg-red-600 text-white animate-pulse" : "bg-black text-white"
                            }`}>
                              {m.talla}
                            </span>
                            <div>
                              <p className={`text-[9px] font-black uppercase leading-none ${esBajoStockTalla ? "text-red-600" : "text-zinc-400"}`}>
                                Stock Local {esBajoStockTalla && " (BAJO)"}
                              </p>
                              <p className={`text-sm font-black italic ${esBajoStockTalla ? "text-red-700" : "text-black"}`}>
                                {m.cantidad} Unidades
                              </p>
                            </div>
                          </div>

                          {esAlmacen && (
                            <div className="flex gap-2">
                              <button
                                disabled={cargando === m.id_modelo}
                                onClick={() => handleTransferir(m.id_modelo, 2)}
                                className="px-3 py-2 bg-white border-2 border-black text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                              >
                                <Send size={10} /> Tumusla
                              </button>
                              <button
                                disabled={cargando === m.id_modelo}
                                onClick={() => handleTransferir(m.id_modelo, 3)}
                                className="px-3 py-2 bg-white border-2 border-black text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                              >
                                <Send size={10} /> Illampu
                              </button>
                            </div>
                          )}
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

  // ... (Resto del código de renderizado Mobile y Desktop sin cambios significativos en la estructura)
  if (isMobile) {
    return (
      <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4 overflow-hidden">
        <div className="p-5 flex justify-between items-center" onClick={() => setAbierto(!abierto)}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-100 border-2 border-black flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <p className="font-black text-black uppercase text-[11px] leading-none mb-1">{producto.nombre}</p>
              <span className={`px-2 py-0.5 text-[9px] font-black border-2 border-black ${esBajoStockGeneral ? 'bg-red-500 text-white animate-pulse' : 'bg-black text-white'}`}>
                {stockSedeTotal} UNIDS
              </span>
            </div>
          </div>
          <div className="bg-black text-white p-2 border-2 border-black">
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
                {Object.keys(modelosPorColor).length} Colores Disponibles
              </p>
            </div>
          </div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-5 py-2 border-[3px] border-black font-black text-xs inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${esBajoStockGeneral ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black'}`}>
            {stockSedeTotal} DISPONIBLES
          </span>
        </td>
        <td className="p-6 text-right">
          <button className="bg-black text-white text-[10px] font-black uppercase px-6 py-3 border-b-4 border-r-4 border-zinc-600 active:translate-y-1 active:border-0 transition-all">
            {abierto ? "CERRAR" : "GESTIONAR"}
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