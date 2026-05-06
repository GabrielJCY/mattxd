"use client";

import { useState } from "react";
import { addProducto } from "../actions";
import Link from "next/link";
import BotonCloudinary from "@/components/BotonCloudinary"; 
import { ArrowLeft, ChevronDown, Check, Loader2 } from "lucide-react";

export default function FormularioProducto({ categorias }: { categorias: any[] }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* NAVEGACIÓN */}
        <nav className="mb-16">
          <Link 
            href="/admin/productos" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] hover:underline group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Inventario
          </Link>
        </nav>

        {/* ENCABEZADO ESTILO MATT */}
        <header className="mb-12 space-y-2">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">
            Nuevo <span className="underline decoration-1 underline-offset-8">Producto</span>
          </h1>
          <div className="h-[2px] w-full bg-black mt-6" />
        </header>

        {/* FORMULARIO */}
        <form 
          action={async (formData) => {
            setIsPending(true);
            if (imageUrl) formData.append("tabla_medidas_url", imageUrl);
            try {
              await addProducto(formData);
            } catch (error) {
              console.error("Error al registrar:", error);
              setIsPending(false);
            }
          }} 
          className="space-y-12"
        >
          
          {/* NOMBRE */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase italic tracking-widest text-zinc-400">Nombre del Producto</label>
            <input 
              name="nombre" 
              required 
              placeholder="EJ. BOTÍN ROCKER BLACK"
              className="w-full border-2 border-black p-4 text-lg font-black uppercase outline-none focus:bg-black focus:text-white transition-all placeholder:opacity-20" 
            />
          </div>

          {/* CATEGORÍA */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase italic tracking-widest text-zinc-400">Categoría</label>
            <div className="relative">
              <select 
                name="id_categoria" 
                required 
                className="w-full border-2 border-black p-4 text-lg font-black uppercase outline-none appearance-none cursor-pointer focus:bg-black focus:text-white transition-all"
              >
                <option value="">SELECCIONAR...</option>
                {categorias.map((cat) => (
                  <option key={cat.id_categoria} value={cat.id_categoria}>
                    {cat.nombre.toUpperCase()} {cat.genero ? `(${cat.genero.toUpperCase()})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* GUÍA DE TALLAS / CLOUDINARY */}
          <div className="space-y-4">
             <label className="text-[11px] font-black uppercase italic tracking-widest text-zinc-400">Subir guía de tallas</label>
             <BotonCloudinary onSuccess={(url) => setImageUrl(url)} />
             {imageUrl && (
               <div className="p-4 border-2 border-black bg-zinc-100 text-[10px] font-black uppercase flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                 <Check size={14} strokeWidth={3} className="text-green-600" /> 
                 Imagen de medidas vinculada
               </div>
             )}
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase italic tracking-widest text-zinc-400">Descripción Técnica</label>
            <textarea 
              name="descripcion" 
              rows={4} 
              placeholder="MATERIAL, TIPO DE FORRO, ALTURA DE PLATAFORMA..."
              className="w-full border-2 border-black p-4 font-bold uppercase outline-none focus:bg-black focus:text-white transition-all placeholder:opacity-20 resize-none" 
            />
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-black text-white py-6 text-[12px] font-black uppercase tracking-[0.5em] hover:bg-zinc-800 transition-all border-2 border-black flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Procesando...
              </>
            ) : (
              "Confirmar Registro"
            )}
          </button>
        </form>
      </div>
      
      {/* PIE DE PÁGINA ESTILO TERMINAL */}
      <footer className="max-w-2xl mx-auto px-6 pb-12 text-center">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-300">
          Matt Bolivia // Registro de Activos
        </p>
      </footer>
    </div>
  );
}