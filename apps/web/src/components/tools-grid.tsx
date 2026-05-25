"use client";

import { FeatureCard } from "@/components/ui/feature-card";
import { motion } from "framer-motion";
import { 
  Merge, Scissors, Zap, Repeat, Shield, Search, 
  FileText, Image, FileSpreadsheet, Presentation, 
  RotateCw, Hash, Stamp, PenTool, Lock, Unlock,
  FileCheck, Globe, Trash2, Layout
} from "lucide-react";

import Link from "next/link";

export interface ToolsGridProps {
  // Add props if needed in future
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, filter: "blur(4px)" },
  visible: { 
    y: 0, 
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      stiffness: 100,
      damping: 15
    }
  }
};

const categories = [
  {
    title: "Organize PDF",
    tools: [
      { icon: <Merge size={24} />, title: "Merge PDF", desc: "Combine multiple PDFs into one unified document.", href: "/merge-pdf" },
      { icon: <Scissors size={24} />, title: "Split PDF", desc: "Separate one page or a whole set for easy conversion.", href: "/split-pdf" },
      { icon: <Trash2 size={24} />, title: "Remove Pages", desc: "Select and remove pages from your PDF document.", href: "/remove-pages" },
      { icon: <Layout size={24} />, title: "Organize PDF", desc: "Sort pages of your PDF file however you like.", href: "/organize-pdf" },
    ]
  },
  {
    title: "Optimize PDF",
    tools: [
      { icon: <Zap size={24} />, title: "Compress PDF", desc: "Reduce file size while optimizing for maximal PDF quality.", href: "/compress-pdf" },
      { icon: <PenTool size={24} />, title: "Repair PDF", desc: "Recover data from a corrupted or damaged PDF file.", comingSoon: true },
    ]
  },
  {
    title: "Convert to PDF",
    tools: [
      { icon: <Image size={24} />, title: "IMG to PDF", desc: "Convert JPG images to PDF in seconds.", href: "/jpg-to-pdf" },
      { icon: <FileText size={24} />, title: "Word to PDF", desc: "Make DOC and DOCX files easy to read by converting them to PDF.", href: "/word-to-pdf" },
      { icon: <Presentation size={24} />, title: "PowerPoint to PDF", desc: "Turn your PPT and PPTX presentations into PDF documents.", href: "/ppt-to-pdf" },
      { icon: <FileSpreadsheet size={24} />, title: "Excel to PDF", desc: "Make EXCEL spreadsheets easy to read by converting them to PDF.", href: "/excel-to-pdf" },
      { icon: <Globe size={24} />, title: "HTML to PDF", desc: "Convert webpages to PDF documents.", href: "/html-to-pdf" },
    ]
  },
  {
    title: "Convert from PDF",
    tools: [
      { icon: <Image size={24} />, title: "PDF to JPG", desc: "Extract images from your PDF or save each page as a separate image.", href: "/pdf-to-jpg" },
      { icon: <FileText size={24} />, title: "PDF to Word", desc: "Convert your PDF to WORD documents with incredible accuracy.", comingSoon: true },
      { icon: <Presentation size={24} />, title: "PDF to PowerPoint", desc: "Convert your PDF to POWERPOINT presentations.", comingSoon: true },
      { icon: <FileSpreadsheet size={24} />, title: "PDF to Excel", desc: "Convert your PDF to EXCEL spreadsheets.", comingSoon: true },
    ]
  },
  {
    title: "Edit & Security",
    tools: [
      { icon: <RotateCw size={24} />, title: "Rotate PDF", desc: "Rotate your PDF files as you want. Rotate multiple PDF at same time.", href: "/rotate-pdf" },
      { icon: <Hash size={24} />, title: "Add Page Numbers", desc: "Add page numbers into PDFs with ease.", href: "/add-page-numbers" },
      { icon: <Stamp size={24} />, title: "Add Watermark", desc: "Stamp an image or text over your PDF in seconds.", href: "/add-watermark" },
      { icon: <Lock size={24} />, title: "Protect PDF", desc: "Encrypt your PDF with a password.", comingSoon: true },
      { icon: <Unlock size={24} />, title: "Unlock PDF", desc: "Remove PDF password security, so you can use your PDF freely.", comingSoon: true },
      { icon: <Search size={24} />, title: "OCR PDF", desc: "Make scanned documents searchable with advanced OCR.", href: "/ocr-pdf" },
      { icon: <FileCheck size={24} />, title: "Sign PDF", desc: "Sign yourself or request electronic signatures from others.", comingSoon: true },
    ]
  }
];

export function ToolsGrid() {
  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Every tool you need to work with PDFs
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            These simple tools are easy to use and completely free.
          </p>
        </motion.div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-16"
        >
          {categories.map((category, idx) => {
            let variant = 'default';
            if (category.title.includes('Organize')) variant = 'red';
            else if (category.title.includes('Optimize')) variant = 'green';
            else if (category.title.includes('Convert to')) variant = 'blue';
            else if (category.title.includes('Convert from')) variant = 'orange';

            return (
              <motion.div key={idx} variants={itemVariants} className="space-y-6">
                <h2 className="text-2xl font-bold text-white pl-2 border-l-4 border-zinc-700">{category.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {category.tools.map((tool, tIdx) => (
                     <motion.div key={tIdx} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Link href={(tool as any).href || "#"}>
                        <FeatureCard 
                          icon={tool.icon}
                          title={tool.title}
                          description={tool.desc}
                          variant={variant as any}
                          comingSoon={(tool as any).comingSoon}
                          className="h-full"
                        />
                      </Link>
                     </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
    </div>
  );
}
