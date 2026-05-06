import { 
  getProductoById, 
  getModelosDeProducto, 
  getImagenesProducto, 
} from "@/src/lib/data";
import { notFound } from "next/navigation";
import ProductVisuals from "@/components/productos/ProductVisuals";
import { LikeButtonDetail } from "@/components/productos/LikeButtonDetail";
import { ShieldCheck, Truck } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/src/lib/db";
import GoogleProvider from "next-auth/providers/google";

// --- COMPONENTES INTERACTIVOS (CLIENTE) ---
import { InteractiveActions } from "./InteractiveActions"; 

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const idNum = Number(id);

  const session = await getServerSession(authOptions);
  let idClienteActual = 0;

  if (session?.user?.email) {
    const userRes = await executeQuery(
      "SELECT id_cliente FROM cliente WHERE correo = ? LIMIT 1",
      [session.user.email]
    );
    if (userRes && userRes.length > 0) {
      idClienteActual = Number(userRes[0].id_cliente);
    }
  }

  const [producto, modelos, imagenes] = await Promise.all([
    getProductoById(idNum, idClienteActual),
    getModelosDeProducto(idNum, idClienteActual),
    getImagenesProducto(idNum),
  ]);

  if (!producto) notFound();

  const tieneModelos = modelos.length > 0;
  const precioPrincipal = tieneModelos ? modelos[0].precio : producto.precio;
  const totalLikes = modelos.reduce((acc: number, m: any) => acc + (Number(m.likes) || 0), 0);
  const yaTieneLike = modelos.some((m: any) => m.ya_tiene_like === true);
  const idModeloParaLike = modelos[0]?.id_modelo || producto.id_modelo;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 md:pt-40 pb-10 md:pb-20 px-4 md:px-8 selection:bg-white selection:text-black">
      <div className="max-w-7xl mx-auto">
        
        {/* GRID RESPONSIVO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 xl:gap-24 mb-16 md:mb-32">
          
          {/* VISUALES */}
          <div className="relative w-full">
            <ProductVisuals 
              imagenes={imagenes} 
              productoNombre={producto.nombre} 
            />
          </div>

          {/* CONFIGURACIÓN Y COMPRA */}
          <div className="flex flex-col">
            <header className="flex justify-between items-start mb-6 md:mb-10">
              <div className="flex-1">
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white/40 mb-2 md:mb-3 block">
                  Matt Bolivia // 2026 Collection
                </span>
                {/* Título un poco más pequeño (de 9xl a 7xl) */}
                <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] md:leading-[0.8] text-white break-words">
                  {producto.nombre}
                </h1>
              </div>
              
              <div className="ml-4 shrink-0">
                < LikeButtonDetail 
                  idModelo={idModeloParaLike} 
                  initialLikes={totalLikes}
                  initialIsLiked={yaTieneLike}
                  idCliente={idClienteActual}
                />
              </div>
            </header>

            {/* PRECIO ADAPTABLE (Ligeramente más pequeño) */}
            <div className="mb-10 md:mb-16">
              <span className="text-3xl md:text-5xl font-medium tracking-tighter text-white">
                {precioPrincipal} <span className="text-[10px] md:text-xs font-black text-white/30 tracking-[0.2em] md:tracking-[0.4em] ml-2 md:ml-3 uppercase">Bolivianos</span>
              </span>
            </div>

            <div className="space-y-10 md:space-y-16">
              {/* DESCRIPCIÓN */}
              <div className="max-w-md">
                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/40 mb-4 md:mb-6 border-b border-white/10 pb-2">
                  Especificaciones
                </h4>
                <p className="text-white text-lg md:text-xl leading-relaxed italic font-light">
                  {producto.descripcion || "Manufactura artesanal con materiales de alta resistencia."}
                </p>
              </div>

              {/* ACCIONES INTERACTIVAS (Aquí es donde el usuario elige talla/color) */}
              <div className="bg-white/[0.03] p-1 rounded-[2rem] md:rounded-[2.5rem] border border-white/10">
                <div className="bg-[#0a0a0a] p-5 md:p-8 rounded-[1.9rem] md:rounded-[2.4rem]">
                  <InteractiveActions 
                    productoNombre={producto.nombre} 
                    idProducto={idNum} 
                    modelos={modelos} 
                    tablaMedidasUrl={producto.tabla_medidas_url}
                    idCliente={idClienteActual}
                  />
                </div>
              </div>

              {/* BADGES DE CONFIANZA */}
              <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6 md:pt-10 max-w-md border-t border-white/10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center text-black shrink-0">
                    <Truck size={14} />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white leading-tight">Envíos en <br/>La Paz</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/20 flex items-center justify-center text-white shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white leading-tight">Calidad <br/>Certificada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}