import PdfToJpgTool from "@/components/tools/pdf-to-jpg";

export const metadata = {
  title: "PDF to JPG - Convert PDF to Images | SnapPDF",
  description: "Convert each page of your PDF into high-quality JPG images for free.",
};

export default function PdfToJpgPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24 pb-12 bg-black">
        <PdfToJpgTool />
      </main>
    </div>
  );
}
