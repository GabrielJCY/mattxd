"use client";
import { useState } from "react";
import { deleteSucursal } from "./actions";
import { Trash2, Loader2, X, Check } from "lucide-react";

export function BtnDeleteTienda({ id, nombre }: { id: number, nombre: string }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await deleteSucursal(id);
    if (!res.success) {
      alert(res.message);
      setLoading(false);
      setIsConfirming(false);
    }
    // No hace falta redirigir, revalidatePath en la acción refresca la lista
  };

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
          <span className="text-[9px] font-black uppercase">Confirmar</span>
        </button>
        <button 
          onClick={() => setIsConfirming(false)}
          className="p-3 bg-zinc-800 text-zinc-400 rounded-xl hover:text-white transition-all"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={() => setIsConfirming(true)}
      className="p-3 bg-zinc-800 text-zinc-500 rounded-xl hover:bg-red-600/10 hover:text-red-500 transition-all group"
      title={`Eliminar ${nombre}`}
    >
      <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
    </button>
  );
}