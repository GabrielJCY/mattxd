import { CheckCircle2 } from "lucide-react";

export function SelectorVariantes({ label, opciones, valor, onChange, mostrarStock = false }: any) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opt: any, i: number) => {
          const esActivo = String(opt.id) === String(valor);
          const sinStock = mostrarStock && opt.stock <= 0;

          return (
            <button
              key={`${opt.id}-${i}`}
              type="button"
              disabled={sinStock}
              onClick={() => onChange(String(opt.id))}
              className={`min-w-[80px] px-4 py-3 border-2 font-black text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                esActivo 
                ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" 
                : sinStock ? "opacity-20 bg-slate-100 border-slate-200 cursor-not-allowed" : "bg-white border-slate-200 hover:border-black"
              }`}
            >
              <span className="flex items-center gap-2">
                {opt.nombre.toUpperCase()}
                {esActivo && <CheckCircle2 size={14} />}
              </span>
              {mostrarStock && (
                <span className={`text-[9px] ${esActivo ? "text-yellow-400" : "text-slate-500"}`}>
                  STOCK: {opt.stock}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}