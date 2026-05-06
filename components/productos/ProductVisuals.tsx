"use client"; // IMPORTANTE: Para que el clic funcione

import { useState } from "react";
import Image from "next/image";

export default function ProductVisuals({ imagenes, productoNombre }: { imagenes: any[], productoNombre: string }) {
  // Estado para saber qué foto está viendo el cliente
  const [fotoPrincipal, setFotoPrincipal] = useState(
    imagenes[0]?.url_imagen || "/placeholder-chamarra.png"
  );

  return (
    <div className="space-y-4">
      {/* Imagen Grande con Zoom suave */}
      <div className="aspect-[3/4] bg-zinc-900 rounded-3xl overflow-hidden relative border border-white/5 group">
        <Image 
          src={fotoPrincipal} 
          alt={productoNombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </div>
      
      {/* Miniaturas interactivas */}
      {imagenes.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {imagenes.map((img: any, i: number) => (
            <div 
              key={i} 
              onClick={() => setFotoPrincipal(img.url_imagen)} // Al hacer clic, cambia la grande
              className={`aspect-square bg-zinc-900 rounded-xl overflow-hidden relative border cursor-pointer transition-all ${
                fotoPrincipal === img.url_imagen ? 'border-white' : 'border-white/5 opacity-50'
              }`}
            >
              <Image 
                src={img.url_imagen as string} 
                alt={`Vista ${i + 1}`} 
                fill 
                className="object-cover" 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}