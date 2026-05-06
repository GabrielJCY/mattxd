"use client";

import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function LoginRequiredModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay oscuro con blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          {/* Contenedor del Modal Brutalista */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:rotate-90 transition-transform"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-black p-4 rounded-full text-white">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none">
                  Acceso Restringido
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Debes autenticarte para interactuar con el catálogo de Matt.
                </p>
              </div>

              <div className="grid grid-cols-1 w-full gap-3">
                <button
                  onClick={() => signIn("google")}
                  className="w-full py-4 bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-zinc-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none"
                >
                  Identificarse con Google
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}