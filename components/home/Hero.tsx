"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

// --- COMPONENTE DE PARTÍCULAS (COLOR GRIS INDUSTRIAL) ---
const ParticleMorph = ({ isMobile }: { isMobile: boolean }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const count = isMobile ? 4000 : 10000; 
  const texture = useLoader(THREE.TextureLoader, "/assets/jacket-map.png");
  
  const particles = useMemo(() => {
    const temp = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = texture.image;
    
    const maxSize = 200; 
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    const canvasW = Math.floor(img.width * scale);
    const canvasH = Math.floor(img.height * scale);
    
    canvas.width = canvasW;
    canvas.height = canvasH;
    ctx?.drawImage(img, 0, 0, canvasW, canvasH);
    const imageData = ctx?.getImageData(0, 0, canvasW, canvasH).data;
    
    let minX = canvasW, maxX = 0, minY = canvasH, maxY = 0;

    if (imageData) {
      for (let y = 0; y < canvasH; y++) {
        for (let x = 0; x < canvasW; x++) {
          const index = (y * canvasW + x) * 4;
          if (imageData[index + 3] > 128) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    }

    const points: THREE.Vector3[] = [];
    const boxWidth = maxX - minX;
    const boxHeight = maxY - minY;
    const validWidth = boxWidth > 0 ? boxWidth : 1;
    const validHeight = boxHeight > 0 ? boxHeight : 1;

    const targetWidth3D = isMobile ? 7 : 12.5;
    const targetHeight3D = targetWidth3D * (validHeight / validWidth);

    if (imageData) {
      for (let y = minY; y <= maxY; y += isMobile ? 2 : 1) {
        for (let x = minX; x <= maxX; x += isMobile ? 2 : 1) {
          const index = (y * canvasW + x) * 4;
          if (imageData[index + 3] > 140) {
            const nx = ((x - minX) / validWidth) - 0.5;
            const ny = ((y - minY) / validHeight) - 0.5;
            
            points.push(new THREE.Vector3(nx * targetWidth3D, -ny * targetHeight3D, 0));
          }
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const target = points[i % (points.length || 1)] || new THREE.Vector3(0, 0, 0);
      const random = new THREE.Vector3(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
      temp.push({ random, target });
    }
    return temp;
  }, [texture, isMobile, count]);

  const dummy = new THREE.Object3D();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const cycle = (Math.sin(t * 0.35) + 1) / 2; 
    const morphProgress = THREE.MathUtils.smoothstep(cycle, 0.15, 0.85);

    particles.forEach((p, i) => {
      const noise = Math.sin(t + i) * 0.02 * morphProgress;
      const x = THREE.MathUtils.lerp(p.random.x, p.target.x + noise, morphProgress);
      const y = THREE.MathUtils.lerp(p.random.y, p.target.y - 1.2 + noise, morphProgress);
      const z = THREE.MathUtils.lerp(p.random.z, p.target.z, morphProgress);

      dummy.position.set(x, y, z);
      const s = isMobile ? 0.06 : 0.045;
      dummy.scale.setScalar(morphProgress * s + 0.02); 
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.06;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <circleGeometry args={[1, 6]} />
      {/* Partículas en Gris Oscuro para que se vean sobre fondo claro */}
      <meshBasicMaterial 
        color="#2E2E2E" 
        transparent 
        opacity={0.4} 
        blending={THREE.NormalBlending}
        depthWrite={false} 
      />
    </instancedMesh>
  );
};

export const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const textY = useTransform(scrollY, [0, 500], [0, 120]);
  const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative h-[100svh] w-full flex items-center justify-center overflow-hidden bg-[#F5F5F5] isolate">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas 
          camera={{ position: [0, 0, isMobile ? 14 : 11], fov: 60 }}
          dpr={[1, 2]} 
        >
          <Suspense fallback={null}>
            <ParticleMorph isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Gradiente sutil para dar profundidad sobre el fondo claro */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F5] via-transparent to-[#F5F5F5] opacity-60" />
      </div>

      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 text-center px-6 w-full max-w-7xl"
      >
        <div className="mb-8">
          <span className="inline-flex items-center px-6 py-2 border-2 border-[#F57C00] text-[9px] tracking-[0.5em] uppercase bg-[#F57C00]/5 text-[#F57C00] font-black">
            Línea Industrial • Matt Bolivia
          </span>
        </div>

        <div className="flex flex-col items-center mb-12">
          <h1 className="text-[16vw] md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.8] text-[#2E2E2E]">
            MÁXIMA
          </h1>
          <h1 
            className="text-[16vw] md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.8] text-transparent"
            style={{ WebkitTextStroke: '2px #2E2E2E' }}
          >
            PROTECCIÓN
          </h1>
        </div>

        <Link 
          href="/productos"
          className="group relative inline-flex items-center gap-6 px-16 py-6 overflow-hidden bg-[#F57C00] text-white font-black uppercase italic text-[13px] tracking-[0.3em] transition-all hover:bg-[#2E2E2E] active:scale-95 shadow-xl"
        >
          Ver Inventario
          <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
        </Link>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 pointer-events-none opacity-60">
        <span className="text-[8px] font-black tracking-[0.6em] text-[#2E2E2E] uppercase">Deslizar</span>
        <div className="w-[2px] h-12 bg-gradient-to-b from-[#F57C00] to-transparent" />
      </div>

    </section>
  );
};