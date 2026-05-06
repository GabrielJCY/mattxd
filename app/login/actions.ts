"use server";
import { db } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginUniversal(formData: FormData) {
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;
  let targetRoute = ""; 

  try {
    // 1. BUSCAR EN ADMIN
    const resAdmin = await db.execute("SELECT * FROM admin WHERE correo = ?", [correo]);
    if (resAdmin.rows.length > 0) {
      const user = resAdmin.rows[0] as any;
      if (await bcrypt.compare(password, user.password)) {
        await createSession(user.id_admin, 'admin');
        targetRoute = "/admin";
      }
    }

    // 2. BUSCAR EN EMPLEADO (Vendedor)
    if (!targetRoute) {
      // Editado para traer id_sucursal y usarlo en la ruta dinámica
      const resEmp = await db.execute("SELECT * FROM empleado WHERE correo = ?", [correo]);
      if (resEmp.rows.length > 0) {
        const user = resEmp.rows[0] as any;
        if (await bcrypt.compare(password, user.password)) {
          await createSession(user.id_empleado, 'empleado');
          
          // Redirección dinámica usando el ID de la sucursal (Tumusla=2, Illampu=3)
          if (user.id_sucursal) {
            targetRoute = `/vendedora/${user.id_sucursal}`;
          } else {
            targetRoute = "/vendedora"; 
          }
        }
      }
    }

    // 3. BUSCAR EN CLIENTE
    if (!targetRoute) {
      const resCli = await db.execute("SELECT * FROM cliente WHERE correo = ?", [correo]);
      if (resCli.rows.length > 0) {
        const user = resCli.rows[0] as any;
        if (await bcrypt.compare(password, user.password)) {
          await createSession(user.id_cliente, 'cliente');
          targetRoute = "/mi-cuenta";
        }
      }
    }
  } catch (err) {
    console.error("Login Error:", err);
    return { error: "Error de conexión con el servidor" };
  }

  // Si después de buscar en las 3 tablas no hay ruta, falló
  if (!targetRoute) {
    return { error: "Email o contraseña incorrectos" };
  }

  // Redirección final
  redirect(targetRoute);
}

/**
 * Crea la cookie de sesión de forma segura
 */
async function createSession(id: number, role: string) {
  const cookieStore = await cookies();
  cookieStore.set("matt_session", JSON.stringify({ id, role }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  });
}

/**
 * Cierra la sesión borrando la cookie
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("matt_session");
  redirect("/login");
}