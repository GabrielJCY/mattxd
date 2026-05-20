import Link from "next/link";
import { RefreshCcw } from "lucide-react";

export default function BtnDevoluciones({ fechaDesde, fechaHasta }: { fechaDesde: string, fechaHasta: string }) {
  return (
    <Link 
      href={`/admin/top-devoluciones?desde=${fechaDesde}&hasta=${fechaHasta}`}
      className="border-[3px] border-black bg-white text-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:col-span-1 group hover:bg-black hover:text-white transition-all flex flex-col justify-center relative overflow-hidden h-full min-h-[220px]"
    >
      <div className="relative z-10">
        <RefreshCcw size={32} strokeWidth={2.5} className="mb-4 text-red-600 group-hover:text-red-400 transition-colors" />
        <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
          TOP <br/> <span className="text-xl">DEVOLUCIONES</span>
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-4 text-gray-500 group-hover:text-gray-300 transition-colors">
          Auditar anulaciones ➔
        </p>
      </div>
      
      {/* Icono gigante de fondo */}
      <RefreshCcw 
        size={140} 
        className="absolute -bottom-6 -right-6 text-red-600 opacity-5 group-hover:opacity-10 transition-opacity" 
      />
    </Link>
  );
}