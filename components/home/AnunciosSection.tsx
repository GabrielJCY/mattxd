import Image from "next/image";
import Link from "next/link";
import { Tag, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

export function AnunciosSection({ anuncios }: { anuncios: any[] }) {
  // Si no hay anuncios activos en la base de datos, no mostramos nada
  if (!anuncios || anuncios.length === 0) return null;

  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto bg-[#F5F5F5]">
      {/* 1. ENCABEZADO DE SECCIÓN - Estilo Advertencia Industrial */}
      <div className="flex flex-col items-center mb-16 text-center">
        <div className="flex items-center gap-4 mb-4">
          <AlertTriangle className="text-[#F57C00]" size={32} />
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#2E2E2E]">
            ALERTAS DE <span className="text-[#F57C00]">PRECIO</span>
          </h2>
        </div>
        <p className="text-zinc-500 uppercase tracking-[0.4em] text-[10px] font-black border-y-2 border-zinc-200 py-2">
          Disponibilidad Limitada • Equipo Certificado
        </p>
      </div>

      {/* 2. CUADRÍCULA DE ANUNCIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {anuncios.map((anuncio: any) => (
          <div 
            key={anuncio.id_anuncio} 
            className="relative aspect-video md:h-[450px] overflow-hidden border-4 border-[#2E2E2E] bg-white group shadow-[8px_8px_0px_0px_rgba(46,46,46,1)]"
          >
            {/* Imagen de fondo con filtro técnico */}
            {anuncio.imagen_url && (
              <Image 
                src={anuncio.imagen_url} 
                alt={anuncio.titulo} 
                fill 
                className="object-cover grayscale-[20%] opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
              />
            )}
            
            {/* Overlay gradiente técnico */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E2E] via-[#2E2E2E]/30 to-transparent" />
            
            {/* Etiqueta de Descuento - Estilo Sello de Seguridad */}
            {anuncio.descuento > 0 && (
              <div className="absolute top-8 left-8 z-20 bg-[#FDD835] text-[#2E2E2E] px-5 py-2 font-black text-[11px] uppercase tracking-widest shadow-lg flex items-center gap-2 border-2 border-[#2E2E2E]">
                <Tag size={12} className="fill-[#2E2E2E]" />
                DESCUENTO: {anuncio.descuento}%
              </div>
            )}

            {/* Icono de autenticidad en esquina superior derecha */}
            <div className="absolute top-8 right-8 z-20 text-white/40">
                <ShieldCheck size={40} strokeWidth={1} />
            </div>

            {/* Contenido del anuncio */}
            <div className="absolute bottom-10 left-10 right-10 z-20">
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 leading-none text-white">
                {anuncio.titulo}
              </h3>
              <p className="text-sm text-zinc-300 mb-8 line-clamp-2 font-bold uppercase tracking-tight max-w-md border-l-4 border-[#F57C00] pl-4">
                {anuncio.descripcion}
              </p>
              
              <Link 
                href={anuncio.id_producto ? `/productos/${anuncio.id_producto}` : "/productos"} 
                className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] bg-[#F57C00] text-white px-10 py-4 hover:bg-[#2E2E2E] transition-all active:scale-95 shadow-md"
              >
                ADQUIRIR AHORA <ArrowRight size={14} />
              </Link>
            </div>

            {/* Decoración de esquina industrial */}
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-[#FDD835] clip-path-diagonal flex items-end justify-end p-1">
                 <div className="w-full h-full border-t-8 border-l-8 border-[#2E2E2E] rotate-45 translate-x-6 translate-y-6" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}