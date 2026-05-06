import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Permite todas las carpetas y transformaciones de Cloudinary
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Permite las imágenes de prueba que pusimos en el BentoGrid
      },
    ],
  },
  /* Configuración para permitir archivos más grandes en Server Actions */
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Ajusta a 4mb o 10mb según lo que pesen tus fotos de anuncios
    },
  },
};

export default nextConfig;