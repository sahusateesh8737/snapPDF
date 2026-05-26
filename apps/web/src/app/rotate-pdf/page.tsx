import { Navbar } from "@/components/ui/navbar";
import RotatePdfTool from "@/components/tools/rotate-pdf";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF",
  description: "Rotate your PDF files as you want securely in your browser.",
};

export default function RotatePdfPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 text-slate-200">
      <Navbar />
      <div className="pt-24 pb-20 px-4 md:px-8">
        <RotatePdfTool />
      </div>
    </div>
  );
}
