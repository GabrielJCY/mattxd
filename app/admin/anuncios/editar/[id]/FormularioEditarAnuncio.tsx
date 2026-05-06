"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { 
  ImageIcon, 
  Tag, 
  Type, 
  Percent, 
  Activity, 
  ChevronDown,
  Save,
  X 
} from "lucide-react";

export default function FormularioEditarAnuncio({ anuncio, productos }: { anuncio: any, productos: any[] }) {
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(anuncio.imagen_url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVistaPrevia(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form 
      action="/api/admin/anuncios/update" 
      method="POST" 
      encType="multipart/form-data" 
      className="space-y-10"
    >
      {/* ID OCULTO */}
      <input type="hidden" name="id_anuncio" value={anuncio.id_anuncio} />

      {/* 1. SELECCIÓN DE PRODUCTO (BLOQUE SÓLIDO) */}
      <div className="group space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">
          <Tag size={12} strokeWidth={3} /> 01. Producto Vinculado
        </label>
        <div className="relative">
          <select 
            name="id_producto" 
            required
            defaultValue={anuncio.id_producto}
            className="w-full bg-white border-4 border-black p-5 text-sm font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none appearance-none cursor-pointer"
          >
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre} — (BS. {p.precio_base})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black" size={20} strokeWidth={3} />
        </div>
      </div>

      {/* 2. GESTIÓN DE IMAGEN (FRAME RÍGIDO) */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">
          <ImageIcon size={12} strokeWidth={3} /> 02. Media Assets
        </label>
        <div className="relative h-[400px] bg-slate-50 border-4 border-black overflow-hidden group shadow-[12px_12px_0px_0px_rgba(241,245,249,1)] hover:shadow-none transition-all">
          {vistaPrevia ? (
            <img src={vistaPrevia} alt="Preview" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
               <ImageIcon size={48} strokeWidth={1} />
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 text-center">
            <p className="text-white font-black uppercase italic text-lg tracking-tighter">Cambiar Imagen</p>
            <p className="text-slate-400 text-[9px] font-black uppercase mt-2 tracking-widest">Formatos: JPG, PNG, WEBP</p>
          </div>
          
          <input 
            type="file" 
            name="foto_anuncio" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />
        </div>
      </div>

      {/* 3. CAMPOS DE TEXTO (GRID INDUSTRIAL) */}
      <div className="grid grid-cols-2 gap-8">
        <div className="col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">
            <Type size={12} strokeWidth={3} /> 03. Título de Campaña
          </label>
          <input 
            name="titulo" 
            defaultValue={anuncio.titulo}
            required 
            placeholder="EJ: NEW COLLECTION 2026"
            className="w-full border-4 border-black p-5 font-black uppercase italic text-xl focus:bg-slate-50 outline-none transition-colors placeholder:text-slate-200" 
          />
        </div>
        
        <div className="col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">
            <Activity size={12} strokeWidth={3} /> 04. Descripción / Copy
          </label>
          <textarea 
            name="descripcion" 
            defaultValue={anuncio.descripcion}
            rows={3}
            className="w-full border-4 border-black p-5 font-bold italic text-sm text-slate-600 focus:bg-slate-50 outline-none resize-none leading-relaxed" 
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.4em]">
            <Percent size={12} strokeWidth={3} /> 05. OFF%
          </label>
          <input 
            type="number" 
            name="descuento" 
            defaultValue={anuncio.descuento}
            className="w-full border-4 border-black p-5 font-black text-3xl outline-none focus:bg-black focus:text-white transition-all" 
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 block tracking-[0.4em]">06. Status</label>
          <div className="relative">
            <select 
              name="activo" 
              defaultValue={anuncio.activo.toString()}
              className="w-full border-4 border-black p-6 font-black uppercase italic text-xs appearance-none outline-none focus:bg-emerald-400 transition-colors"
            >
              <option value="1">Live / Activo</option>
              <option value="0">Archive / Pausado</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" size={16} strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* ACCIONES (BOTONES DE COMANDO) */}
      <div className="flex flex-col md:flex-row gap-6 pt-10">
        <Link 
          href="/admin/anuncios" 
          className="flex-1 border-4 border-black py-6 flex items-center justify-center gap-3 font-black uppercase italic text-slate-400 hover:bg-slate-100 transition-all active:translate-y-1"
        >
          <X size={18} strokeWidth={3} /> Cancelar Operación
        </Link>
        <button 
          type="submit" 
          className="flex-[2] bg-black text-white py-6 flex items-center justify-center gap-4 font-black uppercase italic text-2xl shadow-[10px_10px_0px_0px_rgba(226,232,240,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <Save size={24} strokeWidth={3} /> Actualizar Registro
        </button>
      </div>
    </form>
  );
}