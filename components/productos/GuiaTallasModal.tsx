"use client";
import { useState } from "react";
import { Ruler, X } from "lucide-react";
import Image from "next/image";

export function GuiaTallasModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 hover:text-white transition-colors"
      >
        <Ruler size={12} /> Guía de tallas
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="relative bg-zinc-950 border border-white/10 p-8 rounded-[3rem] max-w-2xl w-full">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-black uppercase italic mb-8">Guía de Tallas // Matt</h3>
            
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900">
              <Image 
                src="URL_DE_TU_IMAGEN_EN_CLOUDINARY" // <-- TU IMAGEN AQUÍ
                alt="Guía de tallas Matt Bolivia"
                fill
                className="object-contain p-4"
              />
            </div>
            
            <p className="mt-8 text-[10px] text-zinc-600 uppercase tracking-widest text-center">
              * Las medidas son aproximadas para el estándar boliviano.
            </p>
          </div>
        </div>
      )}
    </>
  );
}