"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * Acción para que el cliente actualice su contraseña desde su perfil.
 * Incluye validación de contraseña actual para mayor seguridad.
 */
export async function updateClientePasswordAction(
  idCliente: number, 
  passActual: string, 
  passNueva: string
) {
  try {
    const cliId = Number(idCliente);

    // 1. Obtener la contraseña actual de la base de datos
    const res = await db.execute({
      sql: "SELECT password FROM cliente WHERE id_cliente = ?",
      args: [cliId]
    });

    const cliente = res.rows[0];

    if (!cliente) {
      return { success: false, message: "Usuario no encontrado." };
    }

    /**
     * 2. Verificación de seguridad:
     * Si el cliente ya tiene una contraseña definida (no es solo login de Google),
     * comparamos la contraseña ingresada con el hash de la DB.
     */
    if (cliente.password) {
      const match = await bcrypt.compare(passActual, String(cliente.password));
      if (!match) {
        return { success: false, message: "La contraseña actual es incorrecta." };
      }
    }

    // 3. Generar nuevo Hash para la contraseña nueva
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(passNueva, salt);

    // 4. Actualizar en la base de datos
    await db.execute({
      sql: "UPDATE cliente SET password = ? WHERE id_cliente = ?",
      args: [hashed, cliId]
    });

    console.log(`+ Contraseña actualizada: Cliente ${cliId}`);

    // 5. Revalidar la ruta de configuración
    revalidatePath("/perfil/configuracion");
    
    return { success: true, message: "Contraseña actualizada correctamente." };

  } catch (error) {
    console.error("❌ Error en updateClientePasswordAction:", error);
    return { success: false, message: "Error interno al procesar la solicitud." };
  }
}

/**
 * Acción para actualizar los datos básicos del perfil del cliente.
 */
export async function updatePerfilAction(idCliente: number, nuevoNombre: string) {
  const cliId = Number(idCliente);
  const nombreLimpio = nuevoNombre.trim();

  if (!cliId || !nombreLimpio) {
    return { success: false, error: "Datos de perfil inválidos" };
  }

  try {
    await db.execute({
      sql: "UPDATE cliente SET nombre = ? WHERE id_cliente = ?",
      args: [nombreLimpio, cliId]
    });

    console.log(`+ Perfil actualizado: Cliente ${cliId} -> ${nombreLimpio}`);

    revalidatePath("/perfil");
    revalidatePath("/perfil/configuracion");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("❌ Error crítico en updatePerfilAction:", error);
    return { 
      success: false, 
      error: "No se pudo actualizar la información en la base de datos" 
    };
  }
}

/**
 * Acción para alternar el estado de "Like" en un modelo de producto.
 */
export async function toggleLikeAction(idModelo: number, idCliente: number) {
  const modId = Number(idModelo);
  const cliId = Number(idCliente);

  if (!modId || !cliId) {
    console.error("❌ Error: idModelo o idCliente faltantes o inválidos");
    return { success: false, error: "Datos insuficientes" };
  }

  try {
    const res = await db.execute({
      sql: "SELECT id_like FROM like_producto WHERE id_modelo = ? AND id_cliente = ?",
      args: [modId, cliId]
    });

    const existe = res.rows[0];

    if (existe) {
      await db.execute({
        sql: "DELETE FROM like_producto WHERE id_like = ?",
        args: [Number(existe.id_like)]
      });
      console.log(`- Like eliminado: Modelo ${modId} | Cliente ${cliId}`);
    } else {
      await db.execute({
        sql: "INSERT INTO like_producto (id_modelo, id_cliente) VALUES (?, ?)",
        args: [modId, cliId]
      });
      console.log(`+ Like agregado: Modelo ${modId} | Cliente ${cliId}`);
    }

    const countRes = await db.execute({
      sql: `SELECT COUNT(*) as total 
            FROM like_producto lp
            JOIN modelo m ON lp.id_modelo = m.id_modelo
            WHERE m.id_producto = (SELECT id_producto FROM modelo WHERE id_modelo = ?)`,
      args: [modId]
    });
    
    const totalLikes = Number(countRes.rows[0]?.total || 0);

    revalidatePath("/");
    revalidatePath("/productos");
    revalidatePath("/productos/[id]", "page");
    revalidatePath("/perfil/favoritos"); 
    
    if (process.env.NODE_ENV === "development") {
      revalidatePath("/admin");
    }

    return { 
      success: true, 
      action: existe ? 'removed' : 'added',
      totalLikes: totalLikes 
    };

  } catch (error) {
    console.error("❌ Error crítico en toggleLikeAction:", error);
    return { 
      success: false, 
      error: "Error de conexión con la base de datos" 
    };
  }
}