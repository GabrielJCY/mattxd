import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { executeQuery } from "../../../../src/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {

    async signIn() {
      return true;
    },

    async jwt({ token, user, profile }: any) {

      // Cuando inicia sesión con Google
      if (user) {
        token.email = user.email?.toLowerCase();

        token.given_name =
          profile?.given_name ||
          user.name?.split(" ")[0] ||
          "";

        token.family_name =
          profile?.family_name ||
          user.name?.split(" ").slice(1).join(" ") ||
          "";

        token.picture = user.image;
      }

      if (!token.role && token.email) {
        try {

          // 1️⃣ ADMIN
          const admin = await executeQuery(
            "SELECT id_admin FROM admin WHERE correo = ?",
            [token.email]
          );

          if (admin.length > 0) {
            token.role = "admin";
            token.dbId = admin[0].id_admin;
            return token;
          }

          // 2️⃣ VENDEDOR (Editado para obtener id_sucursal)
          const empleado = await executeQuery(
            "SELECT id_empleado, id_sucursal FROM empleado WHERE correo = ?",
            [token.email]
          );

          if (empleado.length > 0) {
            token.role = "vendedor";
            token.dbId = empleado[0].id_empleado;
            token.sucursalId = empleado[0].id_sucursal; // Guardamos el ID de la sucursal en el token
            return token;
          }

          // 3️⃣ CLIENTE
          const cliente = await executeQuery(
            "SELECT id_cliente FROM cliente WHERE correo = ?",
            [token.email]
          );

          if (cliente.length > 0) {

            token.role = "cliente";
            token.dbId = cliente[0].id_cliente;

          } else {

            // ❗ NO EXISTE EN LA DB
            // LO MANDAMOS A REGISTRO

            token.role = "registro_incompleto";
            token.dbId = null;

          }

        } catch (error) {

          console.error("Error en JWT:", error);

          token.role = "registro_incompleto";
          token.dbId = null;

        }
      }

      return token;
    },

    async session({ session, token }: any) {

      if (session.user) {

        session.user.id = token.dbId;

        session.user.role = token.role;

        session.user.email = token.email;

        session.user.firstName = token.given_name;

        session.user.lastName = token.family_name;

        session.user.image = token.picture;

        session.user.sucursalId = token.sucursalId; // Pasamos el ID de la sucursal a la sesión del cliente

      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };