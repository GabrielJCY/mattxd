import Link from "next/link";
import { UserCheck } from "lucide-react";

export default function BtnEmpleados({ fechaDesde, fechaHasta }: { fechaDesde: string, fechaHasta: string }) {
  return (
    <Link 
      href={`/admin/top-empleados?desde=${fechaDesde}&hasta=${fechaHasta}`}
      className="border-[3px] border-black bg-yellow-400 text-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] lg:col-span-1 group hover:bg-black hover:text-white transition-all flex flex-col justify-center relative overflow-hidden h-full min-h-[220px]"
    >
      <div className="relative z-10">
        <UserCheck size={32} strokeWidth={2.5} className="mb-4" />
        <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">
          STAFF <br/> <span className="text-xl">RENDIMIENTO</span>
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
          Auditar personal ➔
        </p>
      </div>
      
      {/* Icono gigante de fondo */}
      <UserCheck 
        size={140} 
        className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity" 
      />
    </Link>
  );
}