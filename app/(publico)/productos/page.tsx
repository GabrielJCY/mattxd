import { getTodosLosProductos, getCategoriasConImagen } from "@/src/lib/data";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/src/lib/db";
import GoogleProvider from "next-auth/providers/google";
import { LayoutGrid, Filter } from "lucide-react";

export const dynamic = 'force-dynamic';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export default async function ProductosPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ categoria?: string; search?: string; genero?: string }> 
}) {
  const params = await searchParams;
  const idCategoria = params.categoria ? Number(params.categoria) : undefined;
  const queryBusqueda = params.search || ""; 
  const generoSeleccionado = params.genero || ""; 

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

  const [productos, todasLasCategorias] = await Promise.all([
    getTodosLosProductos(idCategoria, queryBusqueda, idClienteActual, generoSeleccionado), 
    getCategoriasConImagen() 
  ]);

  const categoriasParaMostrar = generoSeleccionado 
    ? todasLasCategorias.filter((cat: any) => 
        cat.genero === generoSeleccionado || cat.genero === "Unisex"
      )
    : todasLasCategorias;

  const categoriaActual = todasLasCategorias.find(c => Number(c.id_categoria) === idCategoria);

  return (
    <div className="min-h-screen bg-white text-[#2E2E2E] pt-24 md:pt-40 pb-10 md:pb-20 px-4 md:px-8 selection:bg-[#F57C00] selection:text-white">
      
      {/* LÍNEA DE SEGURIDAD SUPERIOR (Amarillo Seguridad) */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#FDD835] z-50 shadow-sm" />

      <div className="max-w-7xl mx-auto">
        
        {/* HEADER INDUSTRIAL */}
        <header className="mb-12 md:mb-24 border-l-8 border-[#2E2E2E] pl-6 md:pl-10">
          <div className="flex items-center gap-2 mb-4">
             <LayoutGrid size={14} className="text-[#F57C00]" />
             <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-[#2E2E2E]">
               Terminal de Productos // Matt Bolivia
             </span>
          </div>
          <h1 className="text-5xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-[#2E2E2E]">
            {queryBusqueda ? queryBusqueda : (categoriaActual?.nombre || "Catálogo")}
            <br />
            <span className="text-[#F57C00] italic">
              {generoSeleccionado ? `${generoSeleccionado}s` : "Colección"}
            </span>
          </h1>
        </header>

        {/* --- SECCIÓN DE FILTROS --- */}
        <div className="space-y-6 mb-16 md:mb-24">
          
          {/* FILTRO 1: GÉNERO */}
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            <Filter size={14} className="text-zinc-400 shrink-0" />
            <div className="flex gap-2">
              {[
                { label: "Todo", val: "" },
                { label: "Hombres", val: "Hombre" },
                { label: "Mujeres", val: "Mujer" }
              ].map((g) => {
                const p = new URLSearchParams();
                if (g.val) p.set("genero", g.val);
                if (queryBusqueda) p.set("search", queryBusqueda);
                
                return (
                  <Link 
                    key={g.label}
                    href={`/productos?${p.toString()}`}
                    className={`whitespace-nowrap px-8 py-2 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      generoSeleccionado === g.val 
                        ? "bg-[#2E2E2E] text-white border-[#2E2E2E]" 
                        : "border-zinc-100 text-zinc-400 hover:border-[#F57C00] hover:text-[#F57C00]"
                    }`}
                  >
                    {g.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* FILTRO 2: CATEGORÍAS (Burbujas Industriales) */}
          <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-4 no-scrollbar border-t border-zinc-100 pt-6">
            <Link 
              href={`/productos?${generoSeleccionado ? `genero=${generoSeleccionado}` : ""}${queryBusqueda ? `&search=${queryBusqueda}` : ""}`}
              className={`whitespace-nowrap px-6 py-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all shrink-0 ${
                !idCategoria ? "bg-[#F57C00] text-white border-[#F57C00]" : "border-zinc-100 text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              Ver Todo
            </Link>

            {categoriasParaMostrar.map((cat: any) => {
              const p = new URLSearchParams();
              p.set("categoria", cat.id_categoria.toString());
              if (generoSeleccionado) p.set("genero", generoSeleccionado);
              if (queryBusqueda) p.set("search", queryBusqueda);

              return (
                <Link 
                  key={cat.id_categoria}
                  href={`/productos?${p.toString()}`}
                  className={`whitespace-nowrap px-6 py-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all shrink-0 ${
                    idCategoria === Number(cat.id_categoria) 
                      ? "bg-[#F57C00] text-white border-[#F57C00] shadow-md" 
                      : "border-zinc-100 text-zinc-500 hover:border-[#F57C00] hover:text-[#F57C00]"
                  }`}
                >
                  {cat.nombre}
                </Link>
              );
            })}
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        {productos.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-12 md:gap-y-24">
            {productos.map((p: any) => (
              <div key={p.id_producto} className="group">
                <ProductCard 
                  producto={p} 
                  idClienteActual={idClienteActual} 
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 md:py-40 border-4 border-double border-zinc-100 bg-zinc-50/50 rounded-lg text-center">
            <p className="text-zinc-400 uppercase text-[11px] font-black tracking-[0.5em]">
              Sin existencias para esta categoría.
            </p>
          </div>
        )}

        {/* PIE TÉCNICO */}
        <div className="mt-32 pt-10 border-t border-zinc-100 flex justify-between items-center opacity-30 pointer-events-none">
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Matt Bolivia Terminal</span>
          <div className="flex gap-4">
             <div className="w-4 h-4 bg-[#2E2E2E]" />
             <div className="w-4 h-4 bg-[#F57C00]" />
             <div className="w-4 h-4 bg-[#FDD835]" />
          </div>
        </div>

      </div>
    </div>
  );
}