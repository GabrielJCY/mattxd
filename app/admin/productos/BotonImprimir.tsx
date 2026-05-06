"use client"; // 👈 Esto es lo que permite el onClick

import { Printer } from "lucide-react";

export default function BotonImprimir() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-white border-2 border-black text-black px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 flex items-center justify-center gap-3"
    >
      <Printer size={16} />
      Imprimir Etiquetas
    </button>
  );
}