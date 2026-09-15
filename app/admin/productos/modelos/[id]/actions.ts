"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from 'cloudinary';

// CONFIGURACIÓN CLOUDINARY
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- GESTIÓN DE MODELOS Y STOCK ---

export async function getStockModelo(id_modelo: number) {
  try {
    const res = await db.execute({
      sql: "SELECT cantidad FROM stock WHERE id_modelo = ? AND id_sucursal = 4 LIMIT 1",
      args: [id_modelo]
    });
    return res.rows[0] ? Number(res.rows[0].cantidad) : 0;
  } catch (error) {
    console.error("Error al obtener stock:", error);
    return 0;
  }
}

export async function addModelo(formData: FormData) {
  const id_producto = Number(formData.get("id_producto"));
  const talla = formData.get("talla") as string;
  const color = formData.get("color") as string;
  const precio = Number(formData.get("precio"));
  
  const cantidadRaw = formData.get("cantidad");
  const cantidadStr = String(cantidadRaw || "").trim();

  // Validación estricta: Si escribieron algo y no son solo números enteros positivos
  if (cantidadStr !== "" && !/^\d+$/.test(cantidadStr)) {
    return { success: false, message: "❌ El stock inicial no puede contener texto, solo números positivos." };
  }

  const cantidadInicial = cantidadStr !== "" ? Number(cantidadStr) : 0;

  // Validación controlada (Retorna error limpio antes de tocar la BD)
  if (isNaN(cantidadInicial) || cantidadInicial < 0) {
    return { success: false, message: "❌ El stock inicial debe ser un número positivo y no contener texto." };
  }

  try {
    const result = await db.execute({
      sql: "INSERT INTO modelo (id_producto, talla, color, precio, nombre, stock_admin) VALUES (?, ?, ?, ?, ?, ?) RETURNING id_modelo",
      args: [id_producto, talla, color, precio, `${talla} - ${color}`, cantidadInicial],
    });

    const newId = Number(result.rows[0].id_modelo);

    await db.execute({
      sql: "INSERT INTO stock (id_modelo, cantidad, id_sucursal) VALUES (?, ?, ?)",
      args: [newId, cantidadInicial, 4], 
    });

    if (cantidadInicial > 0) {
      await db.execute({
        sql: "INSERT INTO movimiento_inventario (id_modelo, tipo, cantidad, motivo, id_sucursal_destino) VALUES (?, ?, ?, ?, ?)",
        args: [newId, 'ENTRADA', cantidadInicial, 'Carga inicial de stock al crear modelo', 4],
      });
    }

    revalidatePath(`/admin/productos/modelos/${id_producto}`);
    revalidatePath(`/admin/stock`);
    revalidatePath("/", "layout");
    
    return { success: true, message: "Modelo creado correctamente" };
  } catch (error) {
    console.error("Error en addModelo:", error);
    return { success: false, message: "Error al crear el modelo en la base de datos" };
  }
}

export async function updateStock(id_modelo: number, nuevaCantidad: number, id_producto: string) {
  // Validación controlada
  if (isNaN(nuevaCantidad) || nuevaCantidad < 0) {
    return { success: false, message: "❌ La cantidad debe ser un número positivo." };
  }

  try {
    const res = await db.execute({
      sql: "SELECT cantidad FROM stock WHERE id_modelo = ? LIMIT 1",
      args: [id_modelo]
    });
    
    const cantidadAnterior = Number(res.rows[0]?.cantidad || 0);
    const diferencia = nuevaCantidad - cantidadAnterior;

    if (diferencia === 0) return { success: true, message: "Sin cambios en el stock" };

    const tipo = diferencia > 0 ? 'ENTRADA' : 'SALIDA';
    const motivo = "Ajuste manual desde el panel de control";

    await db.execute({
      sql: "UPDATE stock SET cantidad = ? WHERE id_modelo = ?",
      args: [nuevaCantidad, id_modelo],
    });

    await db.execute({
      sql: "UPDATE modelo SET stock_admin = ? WHERE id_modelo = ?",
      args: [nuevaCantidad, id_modelo],
    });

    await db.execute({
      sql: "INSERT INTO movimiento_inventario (id_modelo, tipo, cantidad, motivo, id_sucursal_destino) VALUES (?, ?, ?, ?, ?)",
      args: [id_modelo, tipo, Math.abs(diferencia), motivo, 4],
    });

    revalidatePath(`/admin/productos/modelos/${id_producto}`);
    revalidatePath(`/admin/stock`);
    revalidatePath("/", "layout");
    
    return { success: true, message: "Stock actualizado correctamente" };
  } catch (error) {
    console.error("Error en updateStock:", error);
    return { success: false, message: "Error al actualizar el stock" };
  }
}

export async function deleteModelo(id_modelo: number, id_producto: string) {
  try {
    await db.execute({ sql: "DELETE FROM movimiento_inventario WHERE id_modelo = ?", args: [id_modelo] });
    await db.execute({ sql: "DELETE FROM stock WHERE id_modelo = ?", args: [id_modelo] });
    await db.execute({ sql: "DELETE FROM modelo WHERE id_modelo = ?", args: [id_modelo] });
    
    revalidatePath(`/admin/productos/modelos/${id_producto}`);
    revalidatePath(`/admin/stock`);
    revalidatePath("/", "layout");
    
    return { success: true, message: "Modelo eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar modelo:", error);
    return { success: false, message: "Error al eliminar el modelo" };
  }
}

export async function updateModelo(formData: FormData) {
  const id_modelo = Number(formData.get("id_modelo"));
  const id_producto = formData.get("id_producto") as string;
  const talla = formData.get("talla") as string;
  const color = formData.get("color") as string;
  const precio = Number(formData.get("precio"));
  
  const cantidadRaw = formData.get("cantidad");
  const cantidadStr = String(cantidadRaw || "").trim();

  // VALIDACIÓN ESTRICTA: Si introdujo texto o letras, frena inmediatamente y retorna error con alerta
  if (cantidadStr !== "" && !/^\d+$/.test(cantidadStr)) {
    return { success: false, message: "❌ El stock no puede contener texto, solo números positivos." };
  }

  const cantidadASumar = cantidadStr !== "" ? Number(cantidadStr) : 0;

  // Validación controlada de números negativos
  if (isNaN(cantidadASumar) || cantidadASumar < 0) {
    return { success: false, message: "❌ El stock a sumar debe ser un número positivo." };
  }

  try {
    await db.execute({
      sql: "UPDATE modelo SET talla = ?, color = ?, precio = ?, nombre = ? WHERE id_modelo = ?",
      args: [talla, color, precio, `${talla} - ${color}`, id_modelo],
    });

    if (cantidadASumar > 0) {
      await db.execute({
        sql: "UPDATE stock SET cantidad = cantidad + ? WHERE id_modelo = ? AND id_sucursal = 4",
        args: [cantidadASumar, id_modelo],
      });

      await db.execute({
        sql: "UPDATE modelo SET stock_admin = stock_admin + ? WHERE id_modelo = ?",
        args: [cantidadASumar, id_modelo],
      });

      await db.execute({
        sql: "INSERT INTO movimiento_inventario (id_modelo, tipo, cantidad, motivo, id_sucursal_destino) VALUES (?, ?, ?, ?, ?)",
        args: [id_modelo, 'ENTRADA', cantidadASumar, "Entrada de stock (Suma)", 4],
      });
    }
    
    revalidatePath(`/admin/productos/modelos/${id_producto}`);
    revalidatePath(`/admin/stock`);
    revalidatePath("/", "layout");
    
    return { success: true, message: "Producto actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar modelo:", error);
    return { success: false, message: "Error al actualizar el modelo" };
  }
}

// --- GESTIÓN DE IMÁGENES ---

export async function uploadImagenProducto(formData: FormData) {
  const file = formData.get("imagen") as File;
  const id_producto_raw = formData.get("id_producto");
  const id_producto = id_producto_raw ? Number(id_producto_raw) : null;

  if (!file || file.size === 0 || !id_producto) {
    return { success: false, message: "Datos de imagen no válidos" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "matt-bolivia/productos", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    await db.execute({
      sql: "INSERT INTO imagen_producto (id_producto, url_imagen) VALUES (?, ?)",
      args: [id_producto, uploadResult.secure_url],
    });

    revalidatePath(`/admin/productos/modelos/${id_producto}`);
    revalidatePath("/", "layout");
    
    return { success: true, url: uploadResult.secure_url };
  } catch (error) {
    console.error("Error en uploadImagenProducto:", error);
    return { success: false, message: "Error al subir la imagen" };
  }
}

export async function deleteImagen(id_imagen: number, id_producto: string) {
  try {
    await db.execute({
      sql: "DELETE FROM imagen_producto WHERE id_imagen = ?",
      args: [id_imagen],
    });
    
    revalidatePath(`/admin/productos/modelos/${id_producto}`);
    revalidatePath("/", "layout");
    
    return { success: true, message: "Imagen eliminada correctamente" };
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return { success: false, message: "Error al eliminar la imagen" };
  }
}