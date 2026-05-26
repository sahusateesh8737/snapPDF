import { Navbar } from "@/components/ui/navbar";
import HtmlToPdfTool from "@/components/tools/html-to-pdf";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML to PDF",
  description: "Convert webpages to PDF documents easily and securely.",
};

export default function HtmlToPdfPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 text-slate-200">
      <Navbar />
      <div className="pt-24 pb-20 px-4 md:px-8">
        <HtmlToPdfTool />
      </div>
    </div>
  );
}
