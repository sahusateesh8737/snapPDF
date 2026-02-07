import PdfToPowerPointTool from "@/components/tools/pdf-to-powerpoint";

export const metadata = {
  title: "PDF to PowerPoint - Convert PDF to PPTX | SnapPDF",
  description: "Convert your PDF to editable PowerPoint slides for free.",
};

export default function PdfToPowerPointPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24 pb-12 bg-black">
        <PdfToPowerPointTool />
      </main>
    </div>
  );
}
