"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function MattLogo({ className }: { className?: string }) {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, scale: 0.8, filter: "brightness(2) blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }}
    >
      <Image 
        src="/logo1.png" 
        alt="Matt Bolivia Logo"
        width={500} // Ajusta según el tamaño de tu archivo original
        height={500}
        priority
        className="w-full h-auto object-contain"
      />
    </motion.div>
  );
}