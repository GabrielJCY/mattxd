import { db } from "@/src/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  const res = await db.execute({
    sql: `
      SELECT 
        p.id_producto, 
        p.nombre, 
        MIN(m.precio) as precio_min, 
        MAX(m.precio) as precio_max
      FROM producto p
      JOIN modelo m ON p.id_producto = m.id_producto
      WHERE p.nombre LIKE ?
      GROUP BY p.id_producto
      LIMIT 5
    `,
    args: [`%${query}%`]
  });

  return NextResponse.json(res.rows);
}