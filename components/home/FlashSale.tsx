import Link from "next/link";
import { Zap, ArrowRight, ShieldAlert } from "lucide-react";

export function FlashSale({ ofertas }: { ofertas: any[] }) {
  if (ofertas.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto bg-white border-4 border-[#2E2E2E] p-8 md:p-20 text-[#2E2E2E] flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative shadow-[10px_10px_0px_0px_rgba(46,46,46,1)]">
        
        {/* ELEMENTO DE FONDO INDUSTRIAL */}
        <ShieldAlert className="absolute -top-16 -right-16 text-[#FDD835] w-80 h-80 z-0 rotate-12 opacity-20" />
        
        <div className="relative z-10 flex-1">
          <div className="inline-block bg-[#F57C00] text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest mb-6 skew-x-[-10deg]">
            Liquidación de Inventario
          </div>
          <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-4 text-[#2E2E2E]">
            FLASH <br /> <span className="text-[#F57C00]">SALE</span>
          </h2>
          <p className="text-[11px] font-black tracking-[0.3em] uppercase text-zinc-400 border-l-4 border-[#FDD835] pl-4">
            Precios de fábrica • Tiempo Limitado
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4 w-full lg:w-1/2">
          {ofertas.map((p: any) => (
            <Link 
              href={`/productos/${p.id_producto}`} 
              key={p.id_producto} 
              className="bg-[#F9F9F9] p-6 border-2 border-zinc-100 flex justify-between items-center group hover:border-[#F57C00] hover:bg-white transition-all shadow-sm relative overflow-hidden"
            >
              {/* Indicador lateral de hover */}
              <div className="absolute left-0 top-0 bottom-0 w-0 bg-[#F57C00] group-hover:w-2 transition-all duration-200" />
              
              <div>
                <p className="font-black uppercase text-xl tracking-tight text-[#2E2E2E]">{p.nombre}</p>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-[#F57C00] font-mono tracking-tighter">{p.precio_oferta} BS.</p>
                    <span className="text-[10px] text-zinc-400 line-through font-bold">{p.precio} BS.</span>
                </div>
              </div>
              
              <div className="bg-[#2E2E2E] text-white p-3 group-hover:bg-[#F57C00] transition-colors">
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}