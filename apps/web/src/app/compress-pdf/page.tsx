import { Navbar } from "@/components/ui/navbar";
import CompressPdfTool from "@/components/tools/compress-pdf";

export default function CompressPdfPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 text-slate-200">
      <Navbar />
      <div className="pt-24 pb-20 px-4 md:px-8">
        <CompressPdfTool />
      </div>
    </div>
  );
}
