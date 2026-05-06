"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Star, Zap, MessageCircle } from "lucide-react";

interface ProductCardProps {
  producto: {
    id_producto: number;
    nombre: string;
    precio: number;
    precio_oferta?: number | null;
    imagen_url?: string;
    imagen_principal?: string;
    imagen_secundaria?: string;
    tallas_disponibles?: string[];
    es_nuevo?: boolean;
    es_tendencia?: boolean;
    id_categoria?: number;
  };
  idClienteActual: number;
}

export const ProductCard = ({ producto, idClienteActual }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const imgPrincipal = producto.imagen_url || producto.imagen_principal || "/placeholder.png";
  const tieneOferta = producto.precio_oferta && Number(producto.precio_oferta) < Number(producto.precio);
  const precioMostrar = tieneOferta ? producto.precio_oferta : producto.precio;

  // Lógica de WhatsApp
  const mensajeWhatsapp = `Hola Matt Bolivia! 👋 Quiero pedir información sobre el modelo: ${encodeURIComponent(producto.nombre)}.`;
  const whatsappUrl = `https://wa.me/59175106154?text=${mensajeWhatsapp}`;

  const infoVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } 
    },
    exit: { opacity: 0, y: 5, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      className="group relative bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border border-white/5 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* BADGES */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
        {producto.es_nuevo && (
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-white/10">
            <Zap size={8} className="text-red-500 fill-red-500" />
            New
          </div>
        )}
        {producto.es_tendencia && (
          <div className="flex items-center gap-1 bg-white text-black text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg">
            <Star size={8} className="fill-black" />
            Hot
          </div>
        )}
      </div>

      {/* CONTENEDOR DE IMAGEN */}
      <Link href={`/productos/${producto.id_producto}`} className="relative block aspect-[4/5] overflow-hidden bg-zinc-900">
        <Image
          src={imgPrincipal}
          alt={producto.nombre}
          fill
          className={`object-cover transition-transform duration-700 ease-out ${producto.imagen_secundaria ? 'group-hover:-translate-y-full' : 'group-hover:scale-105'}`}
          sizes="(max-width: 640px) 50vw, 25vw"
          priority
        />

        {producto.imagen_secundaria && (
          <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out">
            <Image
              src={producto.imagen_secundaria}
              alt={producto.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </div>
        )}
        
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      </Link>

      {/* INFO */}
      <div className="p-4 md:p-6">
        <div className="mb-3">
          <p className="text-zinc-600 text-[7px] md:text-[8px] uppercase tracking-[0.3em] mb-1 font-bold">Matt Bolivia</p>
          <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white leading-none truncate mb-2">
            {producto.nombre}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base md:text-lg font-black text-white italic">Bs. {precioMostrar}</span>
            {tieneOferta && (
              <span className="text-[10px] md:text-xs text-zinc-600 line-through">Bs. {producto.precio}</span>
            )}
          </div>
        </div>

        {/* TALLAS (Desktop Only) */}
        <div className="hidden md:block min-h-[35px]">
          <AnimatePresence mode="wait">
            {isHovered && producto.tallas_disponibles && (
              <motion.div
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-wrap gap-1"
              >
                {producto.tallas_disponibles.map((t) => (
                  <span key={t} className="w-7 h-7 flex items-center justify-center border border-white/10 rounded-full text-[9px] font-bold text-zinc-400">
                    {t}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTÓN DE ACCIÓN - AHORA VINCULADO A WHATSAPP */}
        <div className="mt-3 md:mt-1 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
          <Link 
            href={whatsappUrl} 
            target="_blank"
            className="w-full py-3 bg-white text-black rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl"
          >
            <MessageCircle size={12} />
            PEDIR
          </Link>
        </div>
      </div>
    </motion.div>
  );
};