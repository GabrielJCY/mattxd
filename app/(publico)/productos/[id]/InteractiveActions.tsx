"use client";

import { useState, useMemo } from "react";
import { MessageCircle, Ruler, X, Lock, Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { registrarIntencionPedido } from "@/app/admin/pedido/actions";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// --- COMPONENTE DEL MODAL DE LOGIN ---
function LoginRequiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-white border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]" >
            <button onClick={onClose} className="absolute top-4 right-4 text-black hover:rotate-90 transition-transform"><X size={20} strokeWidth={3} /></button>
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-black p-4 rounded-full text-white"><Lock size={32} /></div>
              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase italic text-black">Sesión Requerida</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Para registrar tu pedido, debes iniciar sesión.</p>
              </div>
              <button onClick={() => { onClose(); router.push("/login"); }} className="w-full py-4 bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none transition-all" >
                Ir a Iniciar Sesión
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface InteractiveProps {
  productoNombre: string;
  idProducto: number; 
  modelos: any[];
  tablaMedidasUrl?: string | null;
  idCliente: number; 
}

export function InteractiveActions({ productoNombre, idProducto, modelos, tablaMedidasUrl, idCliente }: InteractiveProps) {
  const [showGuia, setShowGuia] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  // Estado para el color que tiene el "desplegable" abierto
  const [colorAbierto, setColorAbierto] = useState<string | null>(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<any>(null);

  // Normalización para evitar repetidos
  const coloresUnicos = useMemo(() => {
    const setColores = new Set(modelos.map(m => m.color.trim().toUpperCase()));
    return Array.from(setColores);
  }, [modelos]);

  const handleWhatsApp = async () => {
    if (!idCliente || idCliente === 0) { setShowLoginModal(true); return; }
    if (!modeloSeleccionado) return;
    setCargando(true);
    try {
      const res = await registrarIntencionPedido(idCliente, idProducto);
      if (res.success) {
        const telefono = "59178802997"; 
        const mensaje = encodeURIComponent(
          `¡Hola Matt Bolivia! 🧥 Me interesa el modelo *${productoNombre}*.\n\n` +
          `*Detalles:* \n` +
          `- Talla: ${modeloSeleccionado.talla}\n` +
          `- Color: ${modeloSeleccionado.color}\n\n` +
          `Acabo de solicitarlo por la web. ¿Me confirman disponibilidad?`
        );
        window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
      }
    } catch (error) { console.error(error); } finally { setCargando(false); }
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center max-w-md border-b border-white/10 pb-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">Seleccionar Talla</h4>
        <button onClick={() => setShowGuia(true)} className="flex items-center gap-2 text-white/50 hover:text-white transition-all">
          <Ruler size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Guía</span>
        </button>
      </div>

      {/* GRID DE COLORES */}
      <div className="grid grid-cols-2 gap-4 max-w-md relative">
        {coloresUnicos.map((color) => {
          const isSelected = modeloSeleccionado?.color.trim().toUpperCase() === color;
          const isOpen = colorAbierto === color;

          return (
            <div key={color} className="relative">
              {/* Botón de Color */}
              <button
                onClick={() => setColorAbierto(isOpen ? null : color)}
                className={`w-full py-5 px-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                  isSelected 
                    ? "bg-white text-black border-white shadow-xl" 
                    : "bg-zinc-950 text-white border-white/10"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">{color}</span>
                {isSelected ? <Check size={14} strokeWidth={3} /> : <ChevronDown size={14} className={isOpen ? "rotate-180" : ""} />}
              </button>

              {/* Ventanita de Tallas (Pop-over) */}
              <AnimatePresence>
                {isOpen && (
                  <>
                    {/* Overlay invisible para cerrar al hacer clic fuera */}
                    <div className="fixed inset-0 z-[80]" onClick={() => setColorAbierto(null)} />
                    
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 right-0 top-full mt-2 z-[90] bg-zinc-900 border border-white/20 rounded-2xl p-3 shadow-2xl"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        {modelos
                          .filter(m => m.color.trim().toUpperCase() === color)
                          .map((m) => (
                            <button
                              key={m.id_modelo}
                              onClick={() => {
                                setModeloSeleccionado(m);
                                setColorAbierto(null);
                              }}
                              className={`py-3 rounded-lg text-xs font-black italic border transition-all ${
                                modeloSeleccionado?.id_modelo === m.id_modelo
                                  ? "bg-white text-black border-white"
                                  : "bg-black text-white border-white/5 hover:border-white/20"
                              }`}
                            >
                              {m.talla}
                            </button>
                          ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* BOTÓN WHATSAPP */}
      <div className="pt-4">
        <button 
          onClick={handleWhatsApp} 
          disabled={cargando || !modeloSeleccionado} 
          className={`w-full max-w-md py-7 font-black uppercase italic tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 ${
            !modeloSeleccionado 
              ? "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-white/5" 
              : "bg-white text-black hover:invert active:scale-95 shadow-2xl"
          }`}
        >
          <MessageCircle size={18} />
          <span className="text-[11px]">{cargando ? "REGISTRANDO..." : modeloSeleccionado ? `PEDIR ${modeloSeleccionado.talla} ${modeloSeleccionado.color}` : "ELIGER COLOR Y TALLA"}</span>
        </button>
        {!modeloSeleccionado && (
          <p className="text-center text-[8px] text-zinc-600 mt-4 uppercase font-bold tracking-[0.2em]">
            * Toca un color para ver tallas disponibles
          </p>
        )}
      </div>

      {/* MODAL GUÍA DE TALLAS */}
      <AnimatePresence>
        {showGuia && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl" onClick={() => setShowGuia(false)}>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white" onClick={() => setShowGuia(false)}><X size={30} /></button>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="relative w-full h-[70vh] p-6">
              <Image src={tablaMedidasUrl || "/guia-tallas-default.jpg"} alt="Guía" fill className="object-contain" unoptimized />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}