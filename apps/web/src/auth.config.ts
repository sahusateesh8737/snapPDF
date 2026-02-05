import type { NextAuthConfig } from "next-auth"
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: nextUrl }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.nextUrl.pathname.startsWith('/dashboard'); // Example protected route
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // Optional: Redirect logged-in users away from login page?
        // Logic moved here from middleware.ts wrapper if desired, or keep simple
        return true;
      }
      return true;
    },
    jwt({ token, user }) {
        if (user) {
            token.id = user.id
        }
        return token
    },
    session({ session, token }) {
        if (session.user && token.id) {
             // @ts-ignore
            session.user.id = token.id as string
        }
        return session
    }
  },
  providers: [], // Providers configured in auth.ts
  theme: {
    logo: "/logo.png",
    brandColor: "#e53935",
    colorScheme: "dark"
  },
} satisfies NextAuthConfig
