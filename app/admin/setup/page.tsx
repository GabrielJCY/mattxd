"use client";
import { crearPrimerAdmin } from "./actions";

export default function SetupPage() {
  const handleSetup = async () => {
    const res = await crearPrimerAdmin();
    alert(res.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="text-center">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter mb-8">
          Initial <span className="text-gray-200">Setup</span>
        </h1>
        <button 
          onClick={handleSetup}
          className="bg-black text-white px-12 py-6 rounded-full font-black uppercase italic hover:scale-105 transition-all shadow-2xl"
        >
          Crear Administrador Maestro
        </button>
      </div>
    </div>
  );
}