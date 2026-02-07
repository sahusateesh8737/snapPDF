import PptToPdfTool from "../../components/tools/ppt-to-pdf";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PowerPoint to PDF Converter | SnapPDF",
  description: "Convert PowerPoint presentations (PPT, PPTX) to PDF documents instantly. Preserves slides, formatting, and layout.",
};

export default function PptToPdfPage() {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <PptToPdfTool />
      </div>
    </div>
  );
}
