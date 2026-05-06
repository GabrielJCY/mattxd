"use client";
import { MessageCircle } from "lucide-react";

export function BotonWhatsApp({ productoNombre }: { productoNombre: string }) {
  const handleWhatsApp = () => {
    const mensaje = `¡Hola Matt Bolivia! 👟 Me interesa el modelo *${productoNombre}*. ¿Podrían darme más información sobre disponibilidad y colores?`;
    const url = `https://wa.me/591XXXXXXXX?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  return (
    <button 
      onClick={handleWhatsApp}
      className="w-full max-w-md py-8 bg-white text-black font-black uppercase italic tracking-[0.2em] rounded-[2rem] hover:bg-zinc-200 transition-all shadow-2xl flex items-center justify-center gap-4 group"
    >
      <MessageCircle size={22} className="group-hover:scale-110 transition-transform" />
      Pedir por WhatsApp
    </button>
  );
}