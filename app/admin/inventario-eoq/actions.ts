"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { registrarAuditoria } from "@/src/lib/auditoria";

export type EoqFila = {
  id_modelo: number; id_sucursal: number; producto: string; talla: string; color: string;
  sucursal: string; stock: number; demanda_diaria: number | null;
  desviacion_diaria: number | null; costo_pedido: number | null;
  costo_mantenimiento_anual: number | null; plazo_entrega_dias: number | null;
  nivel_servicio: number | null; dias_operativos: number | null;
};

async function administradorAutorizado(): Promise<number | null> {
  const sesion = await getServerSession(authOptions);
  const usuario = sesion?.user as { id?: number | string; role?: string } | undefined;
  let id = usuario?.role === "admin" ? Number(usuario.id) : NaN;
  if (!Number.isSafeInteger(id) || id <= 0) {
    try {
      const raw = (await cookies()).get("matt_session")?.value;
      const manual = raw ? JSON.parse(raw) as { id?: number | string; role?: string } : null;
      id = manual?.role === "admin" ? Number(manual.id) : NaN;
    } catch { return null; }
  }
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  // Un administrador archivado no puede configurar inventarios.
  const res = await db.execute({
    sql: `SELECT 1 FROM admin a WHERE a.id_admin = ?
          AND NOT EXISTS (SELECT 1 FROM papelera p WHERE p.tabla_origen='admin' AND p.id_registro=a.id_admin)`,
    args: [id],
  });
  return res.rows.length ? id : null;
}

export async function listarInventarioEoq(): Promise<EoqFila[]> {
  if (!(await administradorAutorizado())) throw new Error("Acceso no autorizado.");
  const resultado = await db.execute(`
    SELECT m.id_modelo, s.id_sucursal, p.nombre AS producto,
           m.talla, m.color, s.nombre_tienda AS sucursal,
           COALESCE(st.cantidad, 0) AS stock,
           e.demanda_diaria, e.desviacion_diaria, e.costo_pedido,
           e.costo_mantenimiento_anual, e.plazo_entrega_dias,
           e.nivel_servicio, e.dias_operativos
    FROM modelo m
    JOIN producto p ON p.id_producto=m.id_producto
    JOIN stock st ON st.id_modelo=m.id_modelo
    JOIN sucursal s ON s.id_sucursal=st.id_sucursal
    LEFT JOIN inventario_eoq_parametros e
      ON e.id_modelo=m.id_modelo AND e.id_sucursal=s.id_sucursal
    WHERE NOT EXISTS (SELECT 1 FROM papelera x WHERE x.tabla_origen='modelo' AND x.id_registro=m.id_modelo)
      AND NOT EXISTS (SELECT 1 FROM papelera x WHERE x.tabla_origen='producto' AND x.id_registro=p.id_producto)
      AND NOT EXISTS (SELECT 1 FROM papelera x WHERE x.tabla_origen='sucursal' AND x.id_registro=s.id_sucursal)
    ORDER BY s.nombre_tienda, p.nombre, m.talla, m.color
  `);
  return resultado.rows.map(r => ({
    id_modelo: Number(r.id_modelo), id_sucursal: Number(r.id_sucursal),
    producto: String(r.producto), talla: String(r.talla ?? ""), color: String(r.color ?? ""),
    sucursal: String(r.sucursal), stock: Number(r.stock),
    demanda_diaria: r.demanda_diaria == null ? null : Number(r.demanda_diaria),
    desviacion_diaria: r.desviacion_diaria == null ? null : Number(r.desviacion_diaria),
    costo_pedido: r.costo_pedido == null ? null : Number(r.costo_pedido),
    costo_mantenimiento_anual: r.costo_mantenimiento_anual == null ? null : Number(r.costo_mantenimiento_anual),
    plazo_entrega_dias: r.plazo_entrega_dias == null ? null : Number(r.plazo_entrega_dias),
    nivel_servicio: r.nivel_servicio == null ? null : Number(r.nivel_servicio),
    dias_operativos: r.dias_operativos == null ? null : Number(r.dias_operativos),
  }));
}

export async function guardarParametrosEoq(formData: FormData): Promise<{ success: boolean; message: string }> {
  const admin = await administradorAutorizado();
  if (!admin) return { success: false, message: "No autorizado." };
  const n = (clave: string) => Number(formData.get(clave));
  const idModelo = n("id_modelo"), idSucursal = n("id_sucursal");
  const demanda = n("demanda_diaria"), sigma = n("desviacion_diaria");
  const K = n("costo_pedido"), h = n("costo_mantenimiento_anual");
  const L = n("plazo_entrega_dias"), servicio = n("nivel_servicio"), dias = n("dias_operativos");
  if (![idModelo, idSucursal].every(x => Number.isSafeInteger(x) && x > 0) ||
      !Number.isSafeInteger(dias) || dias < 1 || dias > 366 ||
      ![demanda, sigma, K, h, L, servicio].every(Number.isFinite) ||
      demanda <= 0 || sigma < 0 || K <= 0 || h <= 0 || L <= 0 || L > 365 ||
      ![0.90, 0.95, 0.975, 0.99].includes(servicio)) {
    return { success: false, message: "Parámetros inválidos. Revisa los valores y sus unidades." };
  }
  const existe = await db.execute({
    sql: `SELECT 1 FROM stock st JOIN modelo m ON m.id_modelo=st.id_modelo
          JOIN producto p ON p.id_producto=m.id_producto
          JOIN sucursal s ON s.id_sucursal=st.id_sucursal
          WHERE st.id_modelo=? AND st.id_sucursal=?
          AND NOT EXISTS (SELECT 1 FROM papelera x WHERE x.tabla_origen='modelo' AND x.id_registro=m.id_modelo)
          AND NOT EXISTS (SELECT 1 FROM papelera x WHERE x.tabla_origen='producto' AND x.id_registro=p.id_producto)
          AND NOT EXISTS (SELECT 1 FROM papelera x WHERE x.tabla_origen='sucursal' AND x.id_registro=s.id_sucursal)`,
    args: [idModelo, idSucursal],
  });
  if (!existe.rows.length) return { success: false, message: "La variante no está disponible en esa sucursal." };
  try {
    await db.execute({
      sql: `INSERT INTO inventario_eoq_parametros
         (id_modelo,id_sucursal,demanda_diaria,desviacion_diaria,costo_pedido,
          costo_mantenimiento_anual,plazo_entrega_dias,nivel_servicio,dias_operativos)
         VALUES (?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id_modelo,id_sucursal) DO UPDATE SET
           demanda_diaria=excluded.demanda_diaria,
           desviacion_diaria=excluded.desviacion_diaria,
           costo_pedido=excluded.costo_pedido,
           costo_mantenimiento_anual=excluded.costo_mantenimiento_anual,
           plazo_entrega_dias=excluded.plazo_entrega_dias,
           nivel_servicio=excluded.nivel_servicio,
           dias_operativos=excluded.dias_operativos,
           actualizado_en=CURRENT_TIMESTAMP`,
      args: [idModelo,idSucursal,demanda,sigma,K,h,L,servicio,dias],
    });
    revalidatePath("/admin/inventario-eoq");
  } catch (error) {
    console.error("Error guardando parámetros EOQ:", error);
    return { success: false, message: "No fue posible guardar los parámetros." };
  }
  try {
    await registrarAuditoria({
      accion: "EDITAR", modulo: "INVENTARIO_EOQ", id_registro: idModelo,
      descripcion: `Parámetros EOQ actualizados. Modelo ${idModelo}, sucursal ${idSucursal}, administrador ${admin}.`,
    });
  } catch (error) { console.error("No se pudo registrar la auditoría EOQ:", error); }
  return { success: true, message: "Parámetros guardados correctamente." };
}
