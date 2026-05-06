"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Tag, Zap, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AnunciosPopup({ anuncios }: { anuncios: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [anuncioVisible, setAnuncioVisible] = useState<any>(null);

  useEffect(() => {
    if (anuncios && anuncios.length > 0) {
      const elegido = anuncios[Math.floor(Math.random() * anuncios.length)];
      setAnuncioVisible(elegido);

      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [anuncios]);

  if (!anuncioVisible) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-10 sm:p-6">
          {/* Fondo sutil con desenfoque técnico */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-[#2E2E2E]/40 backdrop-blur-[2px]"
          />

          {/* Card Industrial Compacta */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="relative w-full max-w-[360px] bg-white border-[3px] border-[#2E2E2E] shadow-[12px_12px_0px_0px_rgba(46,46,46,1)] overflow-hidden flex flex-col"
          >
            {/* Botón Cerrar Estilo Industrial */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 z-50 bg-[#2E2E2E] text-white p-2 hover:bg-[#F57C00] transition-colors"
            >
              <X size={14} />
            </button>

            {/* Layout de Contenido */}
            <div className="flex flex-col">
              
              {/* Imagen Banner con filtro de escala de grises suave */}
              <div className="relative h-32 w-full border-b-2 border-zinc-100">
                {anuncioVisible.imagen_url ? (
                  <Image 
                    src={anuncioVisible.imagen_url} 
                    alt={anuncioVisible.titulo}
                    fill 
                    className="object-cover grayscale-[30%]"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-100 flex items-center justify-center">
                     <AlertCircle size={24} className="text-[#FDD835]" />
                  </div>
                )}
                
                {/* Badge de Descuento Estilo Etiqueta Técnica */}
                {anuncioVisible.descuento > 0 && (
                  <div className="absolute top-3 left-4 bg-[#F57C00] text-white px-3 py-1 font-black text-[9px] uppercase tracking-widest shadow-md border border-white">
                    -{anuncioVisible.descuento}% OFF
                  </div>
                )}
              </div>

              {/* Textos y Botones con jerarquía industrial */}
              <div className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="h-[1px] w-4 bg-[#2E2E2E]"></span>
                    <h3 className="text-xl font-black uppercase tracking-tighter text-[#2E2E2E] leading-none">
                    {anuncioVisible.titulo}
                    </h3>
                    <span className="h-[1px] w-4 bg-[#2E2E2E]"></span>
                </div>
                
                <p className="text-zinc-500 text-[10px] mb-5 font-bold uppercase tracking-tight line-clamp-2 px-2 italic border-l-2 border-[#FDD835]">
                  {anuncioVisible.descripcion}
                </p>

                <div className="flex flex-col gap-2">
                    <Link 
                    href={anuncioVisible.id_producto ? `/productos/${anuncioVisible.id_producto}` : "/productos"}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-3 bg-[#2E2E2E] text-white py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F57C00] active:scale-95 transition-all shadow-md"
                    >
                    Inspeccionar Oferta <ArrowRight size={12} />
                    </Link>
                    
                    <button 
                    onClick={() => setIsOpen(false)}
                    className="text-[9px] text-zinc-400 uppercase font-black tracking-widest py-2 hover:text-[#2E2E2E] transition-colors"
                    >
                    Ignorar Aviso
                    </button>
                </div>
              </div>

              {/* Patrón de cebra industrial en la base (decorativo) */}
              <div className="h-1.5 w-full bg-[#FDD835] flex">
                 {[...Array(20)].map((_, i) => (
                   <div key={i} className={`h-full w-4 ${i % 2 === 0 ? 'bg-[#2E2E2E]' : ''} skew-x-[-20deg]`}></div>
                 ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}