import { Navbar } from "@/components/ui/navbar";
import AddPageNumbersTool from "@/components/tools/add-page-numbers-pdf";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Page Numbers",
  description: "Add custom page numbers to your PDF securely in your browser.",
};

export default function AddPageNumbersPage() {
  return (
    <div className="min-h-screen bg-black selection:bg-brand-900 selection:text-brand-100 text-slate-200">
      <Navbar />
      <div className="pt-24 pb-20 px-4 md:px-8">
        <AddPageNumbersTool />
      </div>
    </div>
  );
}
