import { Navbar } from "@/components/ui/navbar";
import { ToolsGrid } from "@/components/tools-grid";

import { DottedGrid } from "@/components/ui/dotted-grid";
import { MouseGlow } from "@/components/ui/mouse-glow";

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 overflow-hidden text-slate-200">
      <DottedGrid />
      <MouseGlow />
      <div className="relative z-10">
        <Navbar />
        <ToolsGrid />
        
        {/* Simple Footer */}
        <footer className="py-12 bg-black border-t border-zinc-900 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} PDF Master. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
