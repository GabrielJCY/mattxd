import Link from "next/link";
import { ArrowLeft, Boxes, Calculator } from "lucide-react";
import { listarInventarioEoq } from "./actions";
import EoqClient from "./EoqClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InventarioEoqPage() {
  const filas = await listarInventarioEoq();
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-black p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin" className="inline-flex gap-2 items-center text-xs font-black uppercase tracking-widest mb-8 hover:underline">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <header className="border-b-4 border-black pb-8 mb-8 flex flex-col sm:flex-row sm:justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500"><Boxes size={16}/> Investigación Operativa II</p>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mt-2">Inventario <span className="text-zinc-400">EOQ</span></h1>
            <p className="text-zinc-500 text-sm mt-3">Política probabilística de revisión continua (Q, R), por variante y sucursal.</p>
          </div>
          <Calculator size={42} className="text-zinc-300" />
        </header>
        <EoqClient filas={filas} />
      </div>
    </main>
  );
}
