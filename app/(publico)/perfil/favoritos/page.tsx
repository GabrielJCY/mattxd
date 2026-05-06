import { getProductosFavoritos } from "@/src/lib/data";
import { ProductCard } from "@/components/product-card";
import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/src/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Boxes, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function FavoritosPage() {
  // 1. Verificar Sesión
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Obtener ID del cliente
  const userRes = (await executeQuery(
    "SELECT id_cliente FROM cliente WHERE correo = ? LIMIT 1",
    [session.user.email]
  )) as any[];
  
  if (!userRes || userRes.length === 0) {
    redirect("/login");
  }
  
  const idClienteActual = Number(userRes[0].id_cliente);

  // 3. Traer Favoritos
  const favoritos = await getProductosFavoritos(idClienteActual);

  return (
    <div className="min-h-screen bg-zinc-900 text-white relative overflow-hidden pt-24 md:pt-40 pb-10 md:pb-20 px-4 md:px-8">
      
      {/* FONDO AMBIENTAL (Consistente con Login) */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "url('/fondo-matt.jpg')", 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'contrast(1.1) brightness(0.5)', 
          }}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER INDUSTRIAL */}
        <header className="mb-12 md:mb-20 px-2 md:px-0">
          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="p-2 bg-[#F57C00]/10 border border-[#F57C00]/30 rounded-lg">
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-[#F57C00] fill-[#F57C00]" />
            </div>
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-zinc-500">
              Inventario Personal
            </span>
          </div>
          <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] md:leading-none">
            Mis Favoritos <br />
            <span className="text-white/20 italic">Seleccionados</span>
          </h1>
          <div className="h-1 w-20 bg-[#F57C00] mt-6 md:mt-8" />
        </header>

        {/* CONTENIDO */}
        {favoritos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 gap-y-8 md:gap-y-16">
            {favoritos.map((p: any) => (
              <ProductCard 
                key={p.id_producto} 
                producto={p} 
                idClienteActual={idClienteActual} 
              />
            ))}
          </div>
        ) : (
          /* ESTADO VACÍO - DISEÑO TIPO FICHA TÉCNICA */
          <div className="py-20 md:py-40 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl md:rounded-[3rem] text-center flex flex-col items-center px-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <Boxes className="w-8 h-8 text-zinc-600" strokeWidth={1} />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm md:text-xl mb-2">
              Sin registros en sistema
            </h3>
            <p className="text-zinc-500 uppercase text-[9px] md:text-xs font-bold tracking-[0.2em] mb-10 leading-relaxed max-w-[250px] md:max-w-none">
              Tu lista de deseos está vacía. Inicia una nueva exploración.
            </p>
            <Link 
              href="/productos" 
              className="group w-full md:w-auto px-10 py-4 bg-[#F57C00] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#ff8c1a] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#F57C00]/20"
            >
              Explorar Catálogo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

      </div>

      {/* DETALLE LATERAL TÉCNICO */}
      <div className="fixed right-6 bottom-6 hidden lg:block opacity-20 pointer-events-none">
        <p className="text-[10px] font-black text-white uppercase tracking-[1em] [writing-mode:vertical-lr]">
          MATT &bull; INV_LOG_2026
        </p>
      </div>
    </div>
  );
}