import { Navbar } from "@/components/ui/navbar";
import SplitPdfTool from "@/components/tools/split-pdf";

export default function SplitPdfPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 pb-20">
      <Navbar />
      <main className="container mx-auto px-4 pt-32">
        <SplitPdfTool />
      </main>
    </div>
  );
}
