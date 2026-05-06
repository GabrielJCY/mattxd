// app/(publico)/page.tsx
import { Star, ArrowRight, Zap, MessageCircle, HardHat, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import { getProductosHome, getCategoriasConImagen, getAnuncios } from "../../src/lib/data";
import { ProductCard } from "@/components/product-card";
import { AnunciosSection } from "@/components/home/AnunciosSection"; 
import { AnunciosPopup } from "@/components/home/AnunciosPopup"; 
import { Hero } from "@/components/home/Hero"; 
import { BentoGrid } from "@/components/home/BentoGrid";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const idClienteActual = user?.id ? Number(user.id) : 0;

  const [productos, categorias, anuncios] = await Promise.all([
    getProductosHome(idClienteActual), 
    getCategoriasConImagen(),
    getAnuncios()
  ]);

  const bentoCategories = categorias.map((cat: any) => {
    const productoDeCategoria = productos.find((p: any) => p.id_categoria === cat.id_categoria);
    const imagenVisual = cat.imagen_url || productoDeCategoria?.imagen_url || productoDeCategoria?.imagen_principal;

    return {
      id: cat.id_categoria,
      title: cat.nombre,
      subtitle: "Ver Especificaciones",
      imageUrl: imagenVisual, 
      href: `/productos?categoria=${cat.id_categoria}`,
      gridClass: "w-[300px] md:w-[450px]" 
    };
  });

  const ultimosModelos = productos.slice(0, 4);
  const tendencias = productos
    .filter((p: any) => (p.likes || 0) > 0)
    .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 4);
    
  const ofertas = productos
    .filter((p: any) => p.precio_oferta !== null && Number(p.precio_oferta) < Number(p.precio))
    .slice(0, 3);

  const whatsappUrl = `https://wa.me/59175106154?text=Hola%20Matt%20Bolivia!%20%F0%9F%A7%A5%20Vi%20su%20tienda%20online%20y%20me%20gustar%C3%ADa%20recibir%20el%20cat%C3%A1logo%20actualizado%2C%20conocer%20precios%20de%20los%20nuevos%20modelos%20y%20la%20ubicaci%C3%B3n%20de%20sus%20sucursales.`;

  return (
    <div className="relative bg-[#F5F5F5] min-h-screen text-[#2E2E2E] font-sans selection:bg-[#F57C00] selection:text-white overflow-x-hidden">
      
      {/* TEXTURA TÉCNICA (Sutil patrón de malla o ruido) */}
      <div className="pointer-events-none fixed inset-0 z-[99] opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <Hero />

      {/* MARQUEE INDUSTRIAL (Alta visibilidad) */}
      <div className="py-3 bg-[#FDD835] overflow-hidden flex whitespace-nowrap border-y-2 border-[#2E2E2E]">
        <div className="flex animate-marquee gap-8 items-center">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-[#2E2E2E] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-8">
              Equipo de Alta Resistencia &bull; Matt Bolivia &bull; Calidad Certificada &bull; <ShieldCheck size={14} />
            </span>
          ))}
        </div>
      </div>

      {/* SECCIÓN DE CATEGORÍAS */}
      <div className="bg-white py-10 border-b border-zinc-200">
        <BentoGrid categories={bentoCategories} />
      </div>

      <AnunciosSection anuncios={anuncios} />

      {/* NEW ARRIVALS - Diseño tipo Catálogo Técnico */}
      <section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-[#F57C00]"></span>
                <span className="text-[#F57C00] text-[10px] font-black uppercase tracking-[0.4em]">Serie Industrial 2026</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none border-l-8 border-[#2E2E2E] pl-4">
              Nuevos <br /> Ingresos
            </h2>
          </div>
          <Link href="/productos" className="flex items-center gap-2 text-[11px] font-black uppercase bg-[#2E2E2E] text-white px-6 py-3 hover:bg-[#F57C00] transition-colors">
            Explorar Inventario <ArrowRight size={14} />
          </Link>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {ultimosModelos.map((producto: any) => (
            <ProductCard key={producto.id_producto} producto={producto} idClienteActual={idClienteActual} />
          ))}
        </div>
      </section>

      {/* TENDENCIAS - Bloque de contraste oscuro */}
      <section className="py-20 md:py-32 bg-[#2E2E2E] text-white px-4 md:px-6 border-y-4 border-[#F57C00]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 md:gap-6 mb-16">
            <div className="bg-[#F57C00] p-3 rounded-sm shadow-xl shrink-0">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">Equipo <span className="text-[#FDD835]">Destacado</span></h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {tendencias.map((producto: any) => (
              <ProductCard key={producto.id_producto} producto={producto} idClienteActual={idClienteActual} />
            ))}
          </div>
        </div>
      </section>

      {/* FLASH SALE - OFF SEASON (Estilo etiqueta de seguridad) */}
      {ofertas.length > 0 && (
        <section className="py-24 px-4 md:px-6 bg-white border-b-8 border-[#FDD835]">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
            
            <div className="w-full lg:w-1/3 space-y-6 text-center lg:text-left">
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-[#2E2E2E]">
                Liquidación <br /><span className="text-[#F57C00]">Stock</span>
              </h2>
              <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed max-w-xs mx-auto lg:mx-0">
                Resistencia comprobada a precios de fábrica. Unidades limitadas en selección Premium.
              </p>
              <Link href="/productos?oferta=true" className="inline-flex items-center gap-4 group">
                <div className="w-12 h-12 bg-[#F57C00] text-white flex items-center justify-center group-hover:bg-[#2E2E2E] transition-colors">
                  <ArrowRight size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-[#F57C00]">Ver Descuentos</span>
              </Link>
            </div>

            <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {ofertas.map((p: any, idx: number) => (
                <Link 
                  href={`/productos/${p.id_producto}`} 
                  key={p.id_producto}
                  className={`group relative overflow-hidden border-2 border-zinc-100 bg-zinc-50 flex flex-col justify-end p-8 transition-all duration-300 hover:border-[#F57C00] ${idx === 0 ? 'md:row-span-2 min-h-[400px] md:min-h-[550px]' : 'h-[250px] md:h-[265px]'}`}
                >
                  <div className="absolute top-6 right-6 z-20 bg-[#F57C00] text-white text-[11px] font-black px-4 py-1 skew-x-[-12deg]">
                    SALE -{Math.round(((p.precio - p.precio_oferta) / p.precio) * 100)}%
                  </div>
                  <div className="absolute inset-0 z-0 group-hover:scale-105 transition-transform duration-700">
                    <Image src={p.imagen_url || p.imagen_principal || "/placeholder.png"} alt={p.nombre} fill className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                  </div>
                  <div className="relative z-10 bg-white/90 p-4 border-l-4 border-[#F57C00]">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-[#2E2E2E] mb-1">{p.nombre}</h3>
                    <p className="text-[#F57C00] font-black text-xl font-mono">Bs. {p.precio_oferta}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER INDUSTRIAL */}
      <footer className="border-t-2 border-zinc-200 py-24 bg-[#F5F5F5] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-16">
          
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[#2E2E2E]">Matt <span className="text-[#F57C00]">Bolivia</span></h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">
              Protección y Estilo Industrial<br/>Workwear & Streetwear Premium
            </p>
          </div>

          <div className="flex flex-col gap-6 items-center md:items-start">
            <span className="text-[11px] font-black text-[#2E2E2E] uppercase tracking-widest bg-[#FDD835] px-4 py-1">Enlace Directo</span>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="https://www.instagram.com/matt.bolivia" target="_blank" className="w-14 h-14 bg-white border border-zinc-200 flex items-center justify-center hover:bg-[#F57C00] hover:text-white hover:border-[#F57C00] transition-all">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </Link>
              <Link href={whatsappUrl} target="_blank" className="w-14 h-14 bg-white border border-zinc-200 flex items-center justify-center hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all">
                <MessageCircle size={22} />
              </Link>
              {/* Icono de Seguridad/Casco como adorno visual */}
              <div className="w-14 h-14 bg-[#2E2E2E] text-[#FDD835] flex items-center justify-center">
                <HardHat size={22} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em]">
            &copy; 2026 &bull; MATT BOLIVIA &bull; División Industrial
          </p>
          <div className="flex gap-6 text-[9px] font-black text-[#2E2E2E] uppercase tracking-widest italic">
            <span>Logística Nacional: Toda Bolivia</span>
          </div>
        </div>
      </footer>

      <AnunciosPopup anuncios={anuncios} />
    </div>
  );
}