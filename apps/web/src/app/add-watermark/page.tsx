import { Navbar } from "@/components/ui/navbar";
import AddWatermarkTool from "@/components/tools/add-watermark-pdf";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Watermark - snapPDF",
  description: "Stamp an image or text over your PDF in seconds securely in your browser.",
};

export default function AddWatermarkPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 text-slate-200">
      <Navbar />
      <div className="pt-24 pb-20 px-4 md:px-8">
        <AddWatermarkTool />
      </div>
    </div>
  );
}
