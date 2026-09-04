import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginUser } from "@/lib/auth-repository";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Mobile", type: "text" },
        email: { label: "Email", type: "text" },
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.password) return null;
          const user = await loginUser({
            identifier: credentials.identifier || credentials.email || credentials.phone,
            email: credentials.email || credentials.identifier,
            phone: credentials.phone || credentials.identifier,
            password: credentials.password,
          });

          if (!user) return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            organizationId: user.organizationId,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.phone = user.phone;
      }
      return token;
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "mahaexam-super-secret-jwt-key-for-local-development-2026",
  trustHost: true,
  pages: {
    signIn: "/login",
  },
});
