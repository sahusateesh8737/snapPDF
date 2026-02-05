"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component, otherwise use standard input or create one
import { Label } from "@/components/ui/label"; // Assuming Label component exists
import { handleGoogleSignIn, login, register } from "@/app/actions";
import { Loader2 } from "lucide-react";

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    try {
      if (isLogin) {
        // login uses signIn which throws redirects or errors, so we handle mostly redirects or catch errors
          await login(formData);
      } else {
        const result = await register(formData);
        
        if (result?.error) {
           setError(result.error);
           return; // Don't flip to login if failed
        }

        if (result?.success) {
            setIsLogin(true);
            setError(""); // ensuring clear
            // Optionally could show a success toast here
        }
      }
    } catch (e) {
        // Fallback for unexpected errors or login redirect (although redirect shouldn't be caught here ideally if it's a success redirect)
        if (e instanceof Error && e.message === "NEXT_REDIRECT") {
             throw e; // Let Next.js handle redirect
        }
        setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="text-slate-400">
          {isLogin ? "Sign in to continue to SnapPDF" : "Get started with SnapPDF for free"}
        </p>
      </div>

      <div className="space-y-4">
        <form action={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-brand-500"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-brand-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-brand-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <Button 
            className="w-full h-11 bg-brand-600 hover:bg-brand-500 text-white font-semibold" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-900 px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <form action={handleGoogleSignIn}>
          <Button 
            variant="outline"
            className="w-full h-11 bg-white text-black hover:bg-slate-200 border-0 font-medium gap-2"
            type="submit"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            Google
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
              }}
              className="text-brand-500 hover:text-brand-400 font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
