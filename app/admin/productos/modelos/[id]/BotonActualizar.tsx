"use client";

interface Props {
  formId: string;
}

export default function BotonActualizar({ formId }: Props) {
  const handleAlerta = () => {
    // Al ser un componente de cliente, aquí sí podemos usar interactividad
    alert("✅ PRODUCTO ACTUALIZADO");
  };

  return (
    <button
      type="submit"
      form={formId}
      onClick={handleAlerta}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
    >
      Actualizar
    </button>
  );
}