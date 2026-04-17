
import { Navbar } from "@/components/ui/navbar";
import { OcrPdfTool } from "@/components/tools/ocr-pdf";

export default function OcrPdfPage() {
  return (
    <div className="min-h-screen bg-black text-slate-200 selection:bg-brand-500/30">
        <Navbar />
        <div className="pt-24 pb-12">
            <OcrPdfTool />
        </div>
    </div>
  );
}
