import { Metadata } from 'next';
import ExcelToPdfTool from '@/components/tools/excel-to-pdf';

export const metadata: Metadata = {
  title: 'Excel to PDF | SnapPDF',
  description: 'Convert Excel spreadsheets (XLS, XLSX) to PDF documents online for free.',
};

export default function ExcelToPdfPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <ExcelToPdfTool />
    </div>
  );
}
