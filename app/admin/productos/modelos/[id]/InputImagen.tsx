"use client";
import { useState, useTransition } from "react";
import { uploadImagenProducto } from "@/app/admin/productos/modelos/[id]/actions";

export default function InputImagen({ id_producto }: { id_producto: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Esta función envuelve la llamada para manejar el feedback
  const handleUpload = async (formData: FormData) => {
    startTransition(async () => {
      const result = await uploadImagenProducto(formData);
      if (result.success) {
        setPreview(null);
        alert("Imagen subida con éxito");
      } else {
        alert(result.message || "Error al subir");
      }
    });
  };

  return (
    <div className="w-full">
      {/* QUITAMOS EL <form> EXTERIOR */}
      <div className="bg-white/5 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-white/20 hover:border-white/40 transition-all w-full">
        <div className="flex flex-col items-center gap-4">
          
          {/* Vista Previa */}
          {preview ? (
            <img 
              src={preview} 
              alt="Vista previa" 
              className={`w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl md:rounded-2xl shadow-2xl border-2 border-white/10 ${isPending ? 'opacity-50 animate-pulse' : ''}`} 
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30 w-8 h-8 md:w-10 md:h-10">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
          )}
          
          <div className="flex flex-col gap-2 w-full items-center">
            {/* Input de archivo - El 'name="imagen"' es vital */}
            <label className="w-full md:w-auto text-center cursor-pointer bg-white text-black px-6 py-3 md:py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-[11px] uppercase hover:bg-gray-200 transition-all active:scale-95">
              {preview ? "Cambiar Foto" : "Seleccionar Foto"}
              <input 
                type="file" 
                name="imagen" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
                disabled={isPending}
              />
            </label>

            {/* Este input hidden asegura que el ID viaje en el mismo formData */}
            <input type="hidden" name="id_producto" value={id_producto} />

            {/* BOTÓN CON formAction: Aquí ocurre la magia */}
            {preview && (
              <button
                type="submit"
                formAction={handleUpload} 
                disabled={isPending}
                className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-6 py-3 md:py-2 rounded-lg md:rounded-xl font-black text-[10px] md:text-[11px] uppercase transition-all disabled:bg-gray-600"
              >
                {isPending ? "Subiendo..." : "Confirmar y Guardar Foto"}
              </button>
            )}
          </div>
          
          <p className="text-[8px] md:text-[9px] text-white/40 font-bold uppercase tracking-widest text-center">
            Formatos: JPG, PNG o WEBP
          </p>
        </div>
      </div>
    </div>
  );
}