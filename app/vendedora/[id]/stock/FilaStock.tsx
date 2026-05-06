"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Modelo {
  id_modelo: number;
  talla: string;
  color: string;
  cantidad: number;
}

interface FilaStockProps {
  productoNombre: string;
  modelos: Modelo[];
  sedeId: string;
}

export default function FilaStock({ productoNombre, modelos, sedeId }: FilaStockProps) {
  const [abierto, setAbierto] = useState(false);
  const [colorExpandido, setColorExpandido] = useState<string | null>(null);

  // Agrupar modelos por color con tipos limpios
  const modelosPorColor = useMemo(() => {
    const grupos: { [key: string]: Modelo[] } = {};
    modelos.forEach(m => {
      const col = String(m.color).trim().toUpperCase();
      if (!grupos[col]) grupos[col] = [];
      grupos[col].push(m);
    });
    return grupos;
  }, [modelos]);

  const stockTotal = modelos.reduce((acc, curr) => acc + Number(curr.cantidad), 0);
  const umbralAlerta = 3;
  const esBajoStockGeneral = stockTotal < (umbralAlerta * 2);

  return (
    <div className="border-[4px] border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 overflow-hidden">
      {/* CABECERA DEL PRODUCTO */}
      <div 
        className={`p-6 flex justify-between items-center cursor-pointer transition-colors ${abierto ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}
        onClick={() => setAbierto(!abierto)}
      >
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-black text-white border-[3px] border-black flex items-center justify-center font-black text-2xl italic shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            {String(productoNombre).charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-black uppercase text-xl leading-none tracking-tighter">{String(productoNombre)}</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">
              {Object.keys(modelosPorColor).length} COLORES DISPONIBLES
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={`hidden md:inline-block px-4 py-2 border-[3px] border-black font-black text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${esBajoStockGeneral ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black'}`}>
            {stockTotal} UNIDADES
          </span>
          <div className="bg-black text-white p-2 border-2 border-black">
            {abierto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* DESPLIEGUE DE COLORES */}
      <AnimatePresence>
        {abierto && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: "auto" }} 
            exit={{ height: 0 }} 
            className="overflow-hidden border-t-[4px] border-black bg-zinc-100"
          >
            <div className="p-6 md:p-10 space-y-6">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">
                Selecciona un color para ver tallas
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(modelosPorColor).map(([color, variantes]) => {
                  const isExpanded = colorExpandido === color;
                  
                  return (
                    <div key={color} className="flex flex-col">
                      <button
                        onClick={() => setColorExpandido(isExpanded ? null : color)}
                        className={`flex items-center justify-between p-5 border-[3px] border-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
                          isExpanded ? "bg-black text-white" : "bg-white text-black hover:bg-zinc-50"
                        }`}
                      >
                        <span className="font-black uppercase italic tracking-tighter text-lg">{String(color)}</span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mt-4 space-y-2"
                          >
                            {variantes.map((m) => {
                              const cantNum = Number(m.cantidad);
                              const esBajo = cantNum < umbralAlerta;
                              return (
                                <div 
                                  key={m.id_modelo} 
                                  className={`border-[3px] border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                                    esBajo ? "bg-red-50" : "bg-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <span className={`w-10 h-10 flex items-center justify-center font-black italic border-2 border-black ${
                                      esBajo ? "bg-red-600 text-white animate-pulse" : "bg-black text-white"
                                    }`}>
                                      {String(m.talla)}
                                    </span>
                                    <div>
                                      <p className="text-[9px] font-black uppercase leading-none text-zinc-400">Existencias</p>
                                      <p className={`text-lg font-black italic ${esBajo ? "text-red-700" : "text-black"}`}>
                                        {cantNum} <span className="text-[10px]">UND</span>
                                      </p>
                                    </div>
                                  </div>
                                  {esBajo ? <AlertTriangle className="text-red-600" size={20} /> : <CheckCircle2 className="text-emerald-500" size={20} />}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}