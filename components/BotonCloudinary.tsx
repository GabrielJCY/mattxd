"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import { Check, Image as ImageIcon } from "lucide-react";

interface Props {
  onSuccess?: (url: string) => void; // 👈 La hacemos opcional con "?"
  initialUrl?: string; 
}

export default function BotonCloudinary({ onSuccess, initialUrl }: Props) {
  const [url, setUrl] = useState(initialUrl || "");

  return (
    <div className="flex flex-col gap-3">
      {/* Mantenemos el input hidden para que el FormData capture la URL automáticamente */}
      <input type="hidden" name="tabla_medidas_url" value={url} />

      <CldUploadWidget
        uploadPreset="ml_default" 
        onSuccess={(result: any) => {
          if (result.info && typeof result.info !== "string") {
            const newUrl = result.info.secure_url;
            setUrl(newUrl); 
            
            // 👈 Solo llamamos a onSuccess si existe
            if (onSuccess) {
              onSuccess(newUrl);
            }
          }
        }}
      >
        {({ open }) => (
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => open()}
              className={`flex items-center gap-2 px-6 py-4 font-black uppercase text-[10px] tracking-widest border-b-4 transition-all active:border-0 active:translate-y-1 ${
                url 
                ? "bg-emerald-500 text-white border-emerald-700" 
                : "bg-zinc-900 text-white border-zinc-600 hover:bg-black"
              }`}
            >
              {url ? <Check size={14} strokeWidth={3} /> : <ImageIcon size={14} strokeWidth={3} />}
              {url ? "Guía Subida Correctamente" : "Subir Guía de Tallas +"}
            </button>

            {url && (
              <span className="text-[8px] font-black text-emerald-500 uppercase italic animate-pulse">
                Sincronizado con Cloudinary
              </span>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}