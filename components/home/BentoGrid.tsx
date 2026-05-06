"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, HardHat } from "lucide-react";
import { Variants } from "framer-motion";
import { useState, useEffect } from "react";

interface CategoriaDB {
  id_categoria?: any;
  id?: any;
  nombre?: any;
  title?: any;
  genero?: any;
  imagen_url?: any;
  imageUrl?: any;
}

interface BentoGridProps {
  categories?: CategoriaDB[];
}

export const BentoGrid = ({ categories = [] }: BentoGridProps) => {
  // 1. Usamos un estado simple
  const [mounted, setMounted] = useState(false);

  // 2. Solo se activa al llegar al navegador
  useEffect(() => {
    setMounted(true);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: (direction: number) => ({
      opacity: 0,
      x: direction, 
      y: 20
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { 
        duration: 1.2, 
        ease: [0.16, 1, 0.3, 1] as const 
      },
    },
  };

  const catHombre = categories.find(c => c.genero?.toLowerCase().trim() === "hombre");
  const catMujer = categories.find(c => c.genero?.toLowerCase().trim() === "mujer");

  const fotoHombre = catHombre?.imagen_url || catHombre?.imageUrl || "/hombre1.png";
  const fotoMujer = catMujer?.imagen_url || catMujer?.imageUrl || "/mujer2.png";

  const cardsMaestras = [
    {
      id: "master-hombre",
      title: "Hombre",
      subtitle: "Dotación Masculina",
      imageUrl: fotoHombre,
      href: "/productos?genero=Hombre",
      direction: -100,
    },
    {
      id: "master-mujer",
      title: "Mujer",
      subtitle: "Dotación Femenina",
      imageUrl: fotoMujer,
      href: "/productos?genero=Mujer",
      direction: 100,
    }
  ];

  // 3. LA CLAVE: Si no está montado, devolvemos NULL. 
  // Esto hace que el servidor NO RENDERICE NADA, por lo tanto NO HAY NADA que comparar.
  if (!mounted) return null;

  return (
    <section className="bg-[#F5F5F5] py-24 px-6 overflow-hidden border-y border-zinc-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header con estilo de Ficha Técnica */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b-4 border-[#2E2E2E] pb-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-3">
              <HardHat size={16} className="text-[#F57C00]" />
              <p className="text-[#F57C00] text-[10px] tracking-[0.5em] uppercase font-black">División de Equipo</p>
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-[#2E2E2E] uppercase tracking-tighter leading-none">
              Línea <span className="text-zinc-400 italic">2026</span>
            </h2>
          </motion.div>
          <Link href="/productos" className="group flex items-center gap-3 bg-[#2E2E2E] text-white px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#F57C00] transition-all">
            Inventario Completo <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Grid Animado */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {cardsMaestras.map((card) => (
            <motion.div
              key={card.id}
              custom={card.direction}
              variants={itemVariants}
              whileHover={{ scale: 0.99 }}
              className="relative overflow-hidden group border-2 border-zinc-200 bg-white shadow-xl min-h-[500px] md:min-h-[650px]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E2E] via-[#2E2E2E]/20 to-transparent z-10 opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 border-2 border-dashed border-zinc-300 m-6">
                  <p className="text-zinc-400 uppercase text-[10px] tracking-widest font-black text-center px-4">
                    Sin Imagen de Registro <br /> ({card.title})
                  </p>
                </div>
              )}

              <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16 z-20">
                <div className="bg-[#FDD835] w-fit px-3 py-1 mb-4 translate-y-4 group-hover:translate-y-0 transition-all duration-700 opacity-0 group-hover:opacity-100">
                  <p className="text-[#2E2E2E] text-[10px] uppercase tracking-[0.3em] font-black">
                    {card.subtitle}
                  </p>
                </div>
                
                <h3 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                  {card.title}
                </h3>
                
                <div className="flex items-center gap-4 transition-all duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                  <div className="h-[3px] w-12 bg-[#F57C00]" />
                  <span className="text-white text-[10px] uppercase tracking-[0.5em] font-black">Inspeccionar Categoría</span>
                </div>
              </div>

              <div className="absolute inset-0 border-0 group-hover:border-[12px] border-[#F57C00]/20 transition-all duration-500 z-25 pointer-events-none" />
              <Link href={card.href} className="absolute inset-0 z-30" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};