import PdfToWordTool from "@/components/tools/pdf-to-word";

export const metadata = {
  title: "PDF to Word - Convert PDF to DOCX | SnapPDF",
  description: "Convert your PDF to editable Word documents for free.",
};

export default function PdfToWordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24 pb-12 bg-black">
        <PdfToWordTool />
      </main>
    </div>
  );
}
