import { Navbar } from "@/components/ui/navbar"
import { AuthForm } from "@/components/auth-form"
import { MouseGlow } from "@/components/ui/mouse-glow"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-black selection:bg-brand-500/30 selection:text-brand-200 overflow-hidden">
      <MouseGlow />
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Radial Gradients */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-red-500/20 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pt-16 px-4">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
