"use server";

import { db } from "@/src/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Configuración de Cloudinary corregida para coincidir con tu .env
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // <--- CAMBIO AQUÍ
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * 1. CREAR ANUNCIO
 */
export async function crearAnuncio(formData: FormData) {
  // Debug temporal: Esto aparecerá en tu terminal negra (no en el navegador)
  console.log("Intentando subir con Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  const titulo = formData.get("titulo")?.toString().toUpperCase() || "";
  const id_producto = formData.get("id_producto")?.toString() || "";
  const descripcion = formData.get("descripcion")?.toString() || "";
  const descuento = parseInt(formData.get("descuento") as string) || 0;
  const activo = parseInt(formData.get("activo") as string) || 1;
  const imagenFile = formData.get("foto_anuncio") as File;

  if (!imagenFile || imagenFile.size === 0) return;

  try {
    const arrayBuffer = await imagenFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const upload: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "anuncios_matt" }, 
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(buffer);
    });

    // Guardar en la DB
    await db.execute(
      `INSERT INTO anuncio (id_producto, titulo, descripcion, imagen_url, descuento, activo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_producto, titulo, descripcion, upload.secure_url, descuento, activo]
    );

    revalidatePath("/admin/anuncios");
  } catch (error) {
    console.error("ERROR_CREAR_ANUNCIO:", error);
    throw new Error("No se pudo crear el anuncio");
  }

  redirect("/admin/anuncios");
}

/**
 * 2. ELIMINAR ANUNCIO
 */
export async function eliminarAnuncio(formData: FormData) {
  const id = formData.get("id_anuncio")?.toString();
  
  if (!id) return;

  try {
    await db.execute(
      "DELETE FROM anuncio WHERE id_anuncio = ?",
      [id]
    );
    
    revalidatePath("/admin/anuncios");
  } catch (error) {
    console.error("ERROR_ELIMINAR_ANUNCIO:", error);
  }
}

/**
 * 3. EDITAR ANUNCIO
 */
export async function editarAnuncio(formData: FormData) {
  const id_anuncio = formData.get("id_anuncio")?.toString();
  const titulo = formData.get("titulo")?.toString().toUpperCase() || "";
  const id_producto = formData.get("id_producto")?.toString() || "";
  const descripcion = formData.get("descripcion")?.toString() || "";
  const descuento = parseInt(formData.get("descuento") as string) || 0;
  const activo = parseInt(formData.get("activo") as string) || 0;
  const imagenFile = formData.get("foto_anuncio") as File;
  
  let imagen_url = formData.get("imagen_url_actual")?.toString() || "";

  if (!id_anuncio) return;

  try {
    if (imagenFile && imagenFile.size > 0) {
      const arrayBuffer = await imagenFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const upload: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "anuncios_matt" }, 
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(buffer);
      });
      imagen_url = upload.secure_url;
    }

    await db.execute(
      `UPDATE anuncio 
       SET id_producto = ?, titulo = ?, descripcion = ?, imagen_url = ?, descuento = ?, activo = ? 
       WHERE id_anuncio = ?`,
      [id_producto, titulo, descripcion, imagen_url, descuento, activo, id_anuncio]
    );

    revalidatePath("/admin/anuncios");
  } catch (error) {
    console.error("ERROR_EDITAR_ANUNCIO:", error);
    throw new Error("No se pudo editar el anuncio");
  }

  redirect("/admin/anuncios");
}