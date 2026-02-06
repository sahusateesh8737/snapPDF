import { Navbar } from "@/components/ui/navbar";
import WordToPdfTool from "@/components/tools/word-to-pdf";

export default function WordToPdfPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 text-slate-200">
      <Navbar />
      <div className="pt-24 pb-20 px-4 md:px-8">
        <WordToPdfTool />
      </div>
    </div>
  );
}
