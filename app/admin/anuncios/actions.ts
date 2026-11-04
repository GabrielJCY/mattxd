"use server";

import { db } from "@/src/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { enviarAPapelera } from "@/src/lib/papelera";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

// Configuración original de Cloudinary.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Obtiene el administrador desde uno de los dos métodos de acceso del prototipo.
async function obtenerIdAdministrador(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).role === "admin") {
    const id = Number((session.user as any).id);
    if (Number.isSafeInteger(id) && id > 0) return id;
  }

  const cookieStore = await cookies();
  const valor = cookieStore.get("matt_session")?.value;
  if (!valor) return null;

  try {
    const manual = JSON.parse(valor);
    const id = Number(manual.id);
    return manual.role === "admin" && Number.isSafeInteger(id) && id > 0
      ? id
      : null;
  } catch {
    return null;
  }
}

// 1. CREAR ANUNCIO
export async function crearAnuncio(formData: FormData) {
  console.log("Intentando subir con Cloud Name:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

  const titulo = formData.get("titulo")?.toString().toUpperCase() || "";
  const id_producto = formData.get("id_producto")?.toString() || "";
  const descripcion = formData.get("descripcion")?.toString() || "";
  const descuentoRaw = formData.get("descuento")?.toString() || "0";
  const activoRaw = formData.get("activo")?.toString() || "1";
  const descuento = Number(descuentoRaw);
  const activo = Number(activoRaw);
  const imagenFile = formData.get("foto_anuncio");

  // VALIDACIONES ORIGINALES
  if (
    titulo.trim().length < 2 ||
    titulo.trim().length > 100 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 %\-]+$/.test(titulo.trim())
  ) return;

  if (!/^[1-9]\d*$/.test(id_producto)) return;
  if (descripcion.length > 1000) return;
  if (!/^\d+$/.test(descuentoRaw) || descuento < 0 || descuento > 100) return;
  if (!["0", "1"].includes(activoRaw)) return;

  if (
    !(imagenFile instanceof File) ||
    imagenFile.size === 0 ||
    imagenFile.size > 5 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(imagenFile.type)
  ) return;

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

    const resultado = await db.execute({
      sql: `INSERT INTO anuncio (id_producto, titulo, descripcion, imagen_url, descuento, activo)
            VALUES (?, ?, ?, ?, ?, ?) RETURNING id_anuncio`,
      args: [id_producto, titulo, descripcion, upload.secure_url, descuento, activo],
    });

    const idAnuncio = Number(resultado.rows[0]?.id_anuncio ?? resultado.lastInsertRowid);
    await registrarAuditoria({
      accion: "CREAR",
      modulo: "ANUNCIOS",
      id_registro: Number.isSafeInteger(idAnuncio) && idAnuncio > 0 ? idAnuncio : null,
      descripcion: `Se creó el anuncio: ${titulo}`,
    });

    revalidatePath("/admin/anuncios");
  } catch (error) {
    console.error("ERROR_CREAR_ANUNCIO:", error);
    throw new Error("No se pudo crear el anuncio");
  }

  redirect("/admin/anuncios");
}

// 2. ENVIAR ANUNCIO A PAPELERA (sin borrarlo físicamente ni eliminar su imagen)
export async function eliminarAnuncio(formData: FormData) {
  const id = formData.get("id_anuncio")?.toString();
  if (!id || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return;

  try {
    const idAdmin = await obtenerIdAdministrador();
    if (idAdmin === null) {
      console.error("ERROR_ELIMINAR_ANUNCIO: Administrador no identificado");
      return;
    }

    const resultado = await enviarAPapelera("anuncio", Number(id), idAdmin);
    if (!resultado.success) {
      console.error("ERROR_ELIMINAR_ANUNCIO:", resultado.error);
      return;
    }

    await registrarAuditoria({
      accion: "ELIMINAR",
      modulo: "ANUNCIOS",
      id_registro: Number(id),
      descripcion: `Se envió el anuncio con ID ${id} a la papelera.`,
    });

    revalidatePath("/admin/anuncios");
    revalidatePath("/admin/papelera");
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("ERROR_ELIMINAR_ANUNCIO:", error);
  }
}

// 3. EDITAR ANUNCIO
export async function editarAnuncio(formData: FormData) {
  const id_anuncio = formData.get("id_anuncio")?.toString();
  const titulo = formData.get("titulo")?.toString().toUpperCase() || "";
  const id_producto = formData.get("id_producto")?.toString() || "";
  const descripcion = formData.get("descripcion")?.toString() || "";
  const descuentoRaw = formData.get("descuento")?.toString() || "0";
  const activoRaw = formData.get("activo")?.toString() || "0";
  const descuento = Number(descuentoRaw);
  const activo = Number(activoRaw);
  const imagenFile = formData.get("foto_anuncio");
  let imagen_url = formData.get("imagen_url_actual")?.toString() || "";

  // VALIDACIONES ORIGINALES
  if (!id_anuncio || !/^[1-9]\d*$/.test(id_anuncio)) return;
  if (
    titulo.trim().length < 2 ||
    titulo.trim().length > 100 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 %\-]+$/.test(titulo.trim())
  ) return;
  if (!/^[1-9]\d*$/.test(id_producto)) return;
  if (descripcion.length > 1000) return;
  if (!/^\d+$/.test(descuentoRaw) || descuento < 0 || descuento > 100) return;
  if (!["0", "1"].includes(activoRaw)) return;

  if (imagenFile instanceof File && imagenFile.size > 0) {
    if (
      imagenFile.size > 5 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(imagenFile.type)
    ) return;
  }

  try {
    if (imagenFile instanceof File && imagenFile.size > 0) {
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

    const resultado = await db.execute({
      sql: `UPDATE anuncio
            SET id_producto = ?, titulo = ?, descripcion = ?, imagen_url = ?, descuento = ?, activo = ?
            WHERE id_anuncio = ?`,
      args: [id_producto, titulo, descripcion, imagen_url, descuento, activo, id_anuncio],
    });

    if (resultado.rowsAffected > 0) {
      await registrarAuditoria({
        accion: "EDITAR",
        modulo: "ANUNCIOS",
        id_registro: Number(id_anuncio),
        descripcion: `Se actualizó el anuncio: ${titulo}`,
      });
    }

    revalidatePath("/admin/anuncios");
  } catch (error) {
    console.error("ERROR_EDITAR_ANUNCIO:", error);
    throw new Error("No se pudo editar el anuncio");
  }

  redirect("/admin/anuncios");
}
