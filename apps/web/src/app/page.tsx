import { Navbar } from "@/components/ui/navbar";
import LandingPage from "@/components/landing-page";

export default function Home() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 overflow-hidden text-slate-200">
      <Navbar />
      <LandingPage />
    </div>
  );
}
