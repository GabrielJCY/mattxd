"use client";
import { motion } from "framer-motion";

interface GenderSelectorProps {
  onSelect: (gender: "HOMBRE" | "MUJER") => void;
}

export default function GenderSelector({ onSelect }: GenderSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <h2 className="text-3xl font-black uppercase italic mb-10 tracking-tighter">
        Selecciona Categoría
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        {/* CARD HOMBRE */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("HOMBRE")}
          className="group cursor-pointer border-[5px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        >
          <div className="h-80 overflow-hidden border-b-[5px] border-black">
            <img 
              src="/hombre.png" 
              alt="Hombre" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="p-6 bg-black text-white flex justify-between items-center">
            <span className="text-4xl font-black uppercase italic">HOMBRE</span>
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold">→</div>
          </div>
        </motion.div>

        {/* CARD MUJER */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("MUJER")}
          className="group cursor-pointer border-[5px] border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        >
          <div className="h-80 overflow-hidden border-b-[5px] border-black">
            <img 
              src="/mujer.png" 
              alt="Mujer" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="p-6 bg-black text-white flex justify-between items-center">
            <span className="text-4xl font-black uppercase italic">MUJER</span>
            <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold">→</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}