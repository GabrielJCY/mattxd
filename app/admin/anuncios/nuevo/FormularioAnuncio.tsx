"use client";
import { useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { 
  Zap, 
  Save, 
  Image as ImageIcon, 
  Type, 
  Percent, 
  Layers, 
  ChevronDown 
} from "lucide-react";

// BOTÓN CON ESTADO DE CARGA BRUTALISTA - Adaptado para móvil
function BotonEnviar({ esEdicion }: { esEdicion: boolean }) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`w-full py-6 md:py-8 border-[3px] md:border-4 border-black font-black uppercase italic text-xl md:text-2xl transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-4 ${
        pending 
          ? "bg-slate-200 cursor-wait text-slate-400 border-slate-300 shadow-none translate-x-1 translate-y-1" 
          : "bg-black text-white hover:bg-white hover:text-black"
      }`}
    >
      {pending ? (
        <span className="animate-pulse text-sm md:text-xl">Procesando...</span>
      ) : (
        <>
          {esEdicion ? <Save className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> : <Zap className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />}
          <span>{esEdicion ? "Actualizar Registro" : "Lanzar Campaña"}</span>
        </>
      )}
    </button>
  );
}

interface FormProps {
  productos: any[];
  action: (formData: FormData) => Promise<void>;
  initialData?: any; 
}

export default function FormularioAnuncio({ productos, action, initialData }: FormProps) {
  const [preview, setPreview] = useState<string | null>(initialData?.imagen_url || null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (formData: FormData) => {
    const seguro = confirm(
      initialData 
        ? "¿Confirmar cambios en la base de datos?" 
        : "¿Publicar este anuncio en el servidor?"
    );
    if (!seguro) return;

    try {
      await action(formData);
    } catch (error: any) {
      if (error.message?.includes("NEXT_REDIRECT") || error.digest?.includes("NEXT_REDIRECT")) {
        return; 
      }
      alert("ERROR CRÍTICO: No se pudo procesar el anuncio.");
    }
  };

  return (
    <form 
      ref={formRef}
      action={handleSubmit} 
      className="space-y-8 md:space-y-10"
    >
      {initialData && (
        <>
          <input type="hidden" name="id_anuncio" value={initialData.id_anuncio} />
          <input type="hidden" name="imagen_url_actual" value={initialData.imagen_url} />
        </>
      )}

      {/* 1. SELECCIÓN DE PRODUCTO */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] md:tracking-[0.4em]">
          <Layers size={14} strokeWidth={3} /> 01. Producto de Referencia
        </label>
        <div className="relative">
          <select 
            name="id_producto" 
            required 
            defaultValue={initialData?.id_producto || ""}
            className="w-full p-4 md:p-5 border-[3px] md:border-4 border-black font-black uppercase italic text-xs md:text-base outline-none bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all appearance-none cursor-pointer"
          >
            <option value="" disabled>— SELECCIONAR ORIGEN —</option>
            {productos.map((p) => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" size={18} strokeWidth={3} />
        </div>
      </div>

      {/* 2. MEDIA UPLOAD */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] md:tracking-[0.4em]">
          <ImageIcon size={14} strokeWidth={3} /> 02. Visual Asset
        </label>
        <div className="border-[3px] md:border-4 border-black relative min-h-[220px] md:min-h-[300px] flex items-center justify-center overflow-hidden bg-slate-50 group transition-all shadow-[4px_4px_0px_0px_rgba(241,245,249,1)]">
          {preview ? (
            <img 
              src={preview} 
              className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" 
              alt="Preview" 
            />
          ) : (
            <div className="text-slate-300 font-black uppercase italic text-center space-y-2 px-6">
              <ImageIcon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-20" />
              <p className="text-[10px] tracking-widest">Arrastra o selecciona el banner</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
             <span className="text-white font-black uppercase italic border-2 border-white px-4 py-2 text-[10px]">Cambiar Archivo</span>
          </div>

          <input 
            type="file" 
            name="foto_anuncio" 
            required={!initialData?.imagen_url} 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer z-30"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>
      </div>

      {/* 3. INPUTS DE TEXTO - Grid Adaptivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="md:col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] md:tracking-[0.4em]">
            <Type size={14} strokeWidth={3} /> 03. Título de Campaña
          </label>
          <input 
            name="titulo" 
            placeholder="TÍTULO EN MAYÚSCULAS" 
            autoComplete="off"
            required 
            defaultValue={initialData?.titulo || ""}
            className="w-full p-4 md:p-5 border-[3px] md:border-4 border-black font-black uppercase italic text-lg md:text-2xl outline-none focus:bg-slate-50 transition-all placeholder:text-slate-200" 
          />
        </div>
        
        <div className="md:col-span-2 space-y-3">
          <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] md:tracking-[0.4em]">
             04. Información Detallada
          </label>
          <textarea 
            name="descripcion" 
            placeholder="Escribe el copy del anuncio aquí..." 
            defaultValue={initialData?.descripcion || ""}
            rows={3}
            className="w-full p-4 md:p-5 border-[3px] md:border-4 border-black font-bold italic text-xs md:text-sm outline-none focus:bg-slate-50 transition-all resize-none leading-relaxed" 
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] md:tracking-[0.4em]">
            <Percent size={14} strokeWidth={3} /> 05. Promo
          </label>
          <div className="relative">
            <input 
              type="number" 
              name="descuento" 
              placeholder="0" 
              defaultValue={initialData?.descuento || 0}
              className="w-full p-4 md:p-5 border-[3px] md:border-4 border-black font-black text-2xl md:text-4xl outline-none focus:bg-black focus:text-white transition-all pr-12" 
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-lg md:text-xl">%</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] md:tracking-[0.4em]">
             06. Estado
          </label>
          <div className="relative">
            <select 
              name="activo" 
              defaultValue={initialData?.activo?.toString() || "1"}
              className="w-full p-5 md:p-6 border-[3px] md:border-4 border-black font-black uppercase italic text-[10px] outline-none focus:bg-emerald-400 transition-all appearance-none cursor-pointer"
            >
              <option value="1">🟢 Publicado / Live</option>
              <option value="0">⚪ Borrador / Draft</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none" size={16} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <BotonEnviar esEdicion={!!initialData} />
      </div>
    </form>
  );
}