import PdfToExcelTool from "@/components/tools/pdf-to-excel";

export const metadata = {
  title: "PDF to Excel - Convert PDF to XLSX | SnapPDF",
  description: "Convert your PDF to Excel spreadsheets for free.",
};

export default function PdfToExcelPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 pt-24 pb-12 bg-black">
        <PdfToExcelTool />
      </main>
    </div>
  );
}
