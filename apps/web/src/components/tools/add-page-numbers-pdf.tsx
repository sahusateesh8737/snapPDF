"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Hash, Loader2, FileText, ArrowDown, CheckCircle, RefreshCcw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Position = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
type Format = "number" | "page-number" | "number-of-total";

export default function AddPageNumbersTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);

  // Configuration State
  const [position, setPosition] = useState<Position>("bottom-center");
  const [format, setFormat] = useState<Format>("number");
  const [skipFirst, setSkipFirst] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setSuccessInfo(null);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        console.error("Error loading PDF", err);
        alert("Could not load PDF.");
        setFile(null);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const resetTool = () => {
    setFile(null);
    setPageCount(0);
    setSuccessInfo(null);
  };

  const handleApplyNumbers = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const textSize = 12;
      const margin = 30; // 30 points margin from edges

      pages.forEach((page, index) => {
        // Skip first page if enabled
        if (skipFirst && index === 0) return;

        // Determine Text
        let text = `${index + 1}`;
        if (format === "page-number") text = `Page ${index + 1}`;
        if (format === "number-of-total") text = `${index + 1} of ${pages.length}`;

        const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
        const { width, height } = page.getSize();

        // Determine X Coordinate
        let x = margin;
        if (position.includes("center")) x = width / 2 - textWidth / 2;
        if (position.includes("right")) x = width - textWidth - margin;

        // Determine Y Coordinate (pdf-lib originates from bottom-left)
        let y = margin;
        if (position.includes("top")) y = height - margin - textSize;

        // Draw the text
        page.drawText(text, {
          x,
          y,
          size: textSize,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_numbered_${file.name}`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ url, filename });

    } catch (error) {
      console.error("Error adding page numbers:", error);
      alert("Failed to add page numbers. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 relative">
       {/* Success Modal */}
       <AnimatePresence>
        {successInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                <CheckCircle size={48} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Page Numbers Added!</h2>
                <p className="text-sm text-slate-400">Your document has been numbered securely.</p>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                    href={successInfo.url} 
                    download={successInfo.filename}
                    className="w-full"
                >
                    <Button className="w-full h-12 text-lg font-semibold bg-brand-600 hover:bg-brand-500 text-white gap-2">
                        <Download size={20} />
                        Download Again
                    </Button>
                </a>
                <Button 
                    variant="outline" 
                    onClick={resetTool}
                    className="w-full h-12 text-lg font-medium border-zinc-700 text-slate-300 hover:bg-zinc-800 hover:text-white gap-2"
                >
                    <RefreshCcw size={20} />
                    Process Another
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Add Page Numbers
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Insert page numbers into your PDF documents with custom positioning and formatting.
        </p>
      </div>

      {!file ? (
      /* Upload Zone */
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer max-w-3xl mx-auto
          border-2 border-dashed rounded-3xl p-12
          transition-all duration-300 ease-in-out
          flex flex-col items-center justify-center text-center gap-6
          ${isDragActive 
            ? "border-brand-500 bg-brand-500/10 scale-[1.02]" 
            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900"}
        `}
      >
        <input {...getInputProps()} />
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center
          transition-all duration-300
          ${isDragActive ? "bg-brand-500 text-white" : "bg-zinc-800 text-brand-500 group-hover:bg-brand-500 group-hover:text-white group-hover:scale-110 shadow-xl"}
        `}>
          <Hash size={40} strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <p className="text-xl font-semibold text-white">
            {isDragActive ? "Drop PDF here" : "Select PDF file"}
          </p>
          <p className="text-sm text-slate-500">
            or drag and drop a PDF here
          </p>
        </div>
        <Button 
          size="lg"
          className="bg-brand-600 hover:bg-brand-500 text-white mt-4 pointer-events-none"
        >
          Select PDF File
        </Button>
      </div>
      ) : (
          /* Editor Zone */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8"
          >
              {/* File Info */}
              <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                          <FileText size={24} />
                      </div>
                      <div className="overflow-hidden">
                          <h3 className="text-white font-medium truncate">{file.name}</h3>
                          <p className="text-slate-500 text-sm">{pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-500 hover:text-red-400">
                      <RefreshCcw size={18} className="mr-2" /> Start Over
                  </Button>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Position Setting */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Position</h4>
                      <div className="grid grid-cols-3 gap-3">
                          {[
                              { id: "top-left", label: "Top Left" },
                              { id: "top-center", label: "Top Center" },
                              { id: "top-right", label: "Top Right" },
                              { id: "bottom-left", label: "Bottom Left" },
                              { id: "bottom-center", label: "Bottom Center" },
                              { id: "bottom-right", label: "Bottom Right" },
                          ].map((pos) => (
                              <div
                                  key={pos.id}
                                  onClick={() => setPosition(pos.id as Position)}
                                  className={`
                                      cursor-pointer p-4 rounded-xl border-2 text-center text-sm font-medium transition-all
                                      ${position === pos.id 
                                          ? 'border-brand-500 bg-brand-500/10 text-white' 
                                          : 'border-zinc-800 bg-zinc-950/50 text-slate-400 hover:border-zinc-700 hover:text-slate-200'}
                                  `}
                              >
                                  {pos.label}
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Format Setting */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Format & Options</h4>
                      <div className="space-y-3">
                          {[
                              { id: "number", label: "1", desc: "Just the number" },
                              { id: "page-number", label: "Page 1", desc: "Includes 'Page' prefix" },
                              { id: "number-of-total", label: "1 of X", desc: "Includes total pages" },
                          ].map((fmt) => (
                              <div
                                  key={fmt.id}
                                  onClick={() => setFormat(fmt.id as Format)}
                                  className={`
                                      flex items-center justify-between cursor-pointer p-4 rounded-xl border-2 transition-all
                                      ${format === fmt.id 
                                          ? 'border-brand-500 bg-brand-500/10 text-white' 
                                          : 'border-zinc-800 bg-zinc-950/50 text-slate-400 hover:border-zinc-700 hover:text-slate-200'}
                                  `}
                              >
                                  <span className="font-semibold">{fmt.label}</span>
                                  <span className="text-xs opacity-70">{fmt.desc}</span>
                              </div>
                          ))}
                          
                          {/* Skip First Page Toggle */}
                          <label className="flex items-center gap-3 p-4 border-2 border-zinc-800 bg-zinc-950/50 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                              <input 
                                type="checkbox" 
                                checked={skipFirst} 
                                onChange={(e) => setSkipFirst(e.target.checked)}
                                className="w-5 h-5 rounded accent-brand-500 bg-zinc-800 border-zinc-700 focus:ring-brand-500 focus:ring-offset-zinc-950"
                              />
                              <div>
                                  <p className="text-white font-medium text-sm">Skip First Page</p>
                                  <p className="text-slate-500 text-xs">Don't add a number to the cover page</p>
                              </div>
                          </label>
                      </div>
                  </div>

              </div>

              {/* Action */}
              <div className="flex flex-col items-center pt-8 border-t border-zinc-800">
                <Button
                    size="lg"
                    onClick={handleApplyNumbers}
                    disabled={isProcessing}
                    className="h-14 px-12 text-lg font-bold rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-900/20 w-full md:w-auto"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Add Page Numbers
                            <ArrowDown className="ml-3 h-5 w-5" />
                        </>
                    )}
                </Button>
              </div>
          </motion.div>
      )}
    </div>
  );
}
