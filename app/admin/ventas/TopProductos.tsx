// app/admin/components/TopProductos.tsx
import Link from "next/link";
import { Package } from "lucide-react";

export default function TopProductos({ fechaDesde, fechaHasta }: { fechaDesde: string, fechaHasta: string }) {
  return (
    <Link 
      href={`/admin/top-productos?desde=${fechaDesde}&hasta=${fechaHasta}`}
      className="border-[3px] border-black bg-black text-white p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:col-span-1 group hover:bg-white hover:text-black transition-all flex flex-col justify-center relative overflow-hidden h-full min-h-[220px]"
    >
      <div className="relative z-10">
        <Package size={32} strokeWidth={2.5} className="mb-4" />
        <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
          RANKING <br/> <span className="text-xl">PRODUCTOS</span>
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
          Ver reporte detallado ➔
        </p>
      </div>
      
      {/* Icono gigante de fondo */}
      <Package 
        size={140} 
        className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-5 transition-opacity" 
      />
    </Link>
  );
}