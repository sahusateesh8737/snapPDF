import { Navbar } from "@/components/ui/navbar"
import { AuthForm } from "@/components/auth-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-brand-900 selection:text-brand-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pt-16 px-4">
        <AuthForm />
      </div>
    </div>
  )
}
