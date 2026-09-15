"use client";

import { useTransition } from "react";
import { updateModelo } from "./actions";

interface Props {
  formId: string;
  idModelo: string | number;
  idProducto: string;
}

export default function BotonActualizar({ formId, idModelo, idProducto }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleActualizar = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. Buscamos el formulario en el DOM
    const formElement = document.getElementById(formId) as HTMLFormElement;
    if (!formElement) return;

    // 2. Extraemos el valor escrito en el input de cantidad
    const inputCantidad = formElement.querySelector("input[name='cantidad']") as HTMLInputElement;
    const valorCrudo = inputCantidad ? inputCantidad.value.trim() : "";

    // 3. VALIDACIÓN ESTRICTA EN CLIENTE: Si hay texto (letras, símbolos o caracteres no numéricos)
    if (valorCrudo !== "" && !/^\d+$/.test(valorCrudo)) {
      alert("❌ El stock no puede contener texto, solo números positivos.");
      return; // SE DETIENE AQUÍ. No continúa ni muestra éxito.
    }

    const formData = new FormData(formElement);

    startTransition(async () => {
      const res = await updateModelo(formData);

      if (!res.success) {
        alert(`❌ ${res.message}`);
        return;
      }

      alert("✅ PRODUCTO ACTUALIZADO");
    });
  };

  return (
    <button
      type="button"
      onClick={handleActualizar}
      disabled={isPending}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
    >
      {isPending ? "Actualizando..." : "Actualizar"}
    </button>
  );
}