import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send",
          hd: "uees.edu.ec",
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      return profile?.email?.endsWith("@uees.edu.ec") ?? false;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      if (session.user?.email) {
        (session as any).isProfesor =
          session.user.email === process.env.PROFESSOR_EMAIL;
      }
      return session;
    },
  },
};
