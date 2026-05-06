"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  idModelo: number;
  idCliente: number;
  nombreCliente: string;
}

export function ResenaForm({ idModelo, idCliente, nombreCliente }: Props) {
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;

    setEnviando(true);
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_modelo: idModelo,
          id_cliente: idCliente,
          comentario: comentario,
          calificacion: 5 // Valor por defecto ya que lo ignoramos en la vista
        }),
      });

      if (res.ok) {
        setEnviado(true);
        setComentario("");
        router.refresh(); // Refresca los datos del servidor para ver la nueva reseña
      }
    } catch (error) {
      console.error("Error al enviar reseña:", error);
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <div className="p-10 rounded-[3rem] bg-white text-black flex items-center gap-6 animate-in fade-in zoom-in duration-500">
        <CheckCircle2 size={40} />
        <div>
          <p className="font-black uppercase italic text-lg">¡Gracias, {nombreCliente}!</p>
          <p className="text-xs uppercase font-bold tracking-widest opacity-60">Tu opinión ha sido publicada.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative group">
        <textarea 
          required
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe tu testimonio sobre este modelo..."
          className="w-full bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 text-white text-lg font-light italic focus:outline-none focus:border-white/20 transition-all min-h-[150px] resize-none"
        />
        <button 
          disabled={enviando}
          type="submit"
          className="absolute bottom-6 right-6 p-4 bg-white text-black rounded-2xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
      <p className="text-[9px] text-zinc-700 uppercase tracking-[0.4em] px-4">
        Estás comentando como <span className="text-zinc-400">{nombreCliente}</span>
      </p>
    </form>
  );
}