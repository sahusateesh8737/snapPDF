"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowDown, Loader2, FileText, Scissors, CheckCircle, RefreshCcw, Download, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

export default function RemovePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);
  const [pagesToRemove, setPagesToRemove] = useState<Set<number>>(new Set());

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setSuccessInfo(null);
      setPagesToRemove(new Set());
      
      // Load PDF to get page count
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPageCount(pdfDoc.getPageCount());
      } catch (err) {
        console.error("Error loading PDF", err);
        alert("Could not load PDF. It might be corrupted or password protected.");
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
    setPagesToRemove(new Set());
  };

  const togglePageRemoval = (pageIndex: number) => {
    const newSelected = new Set(pagesToRemove);
    if (newSelected.has(pageIndex)) {
      newSelected.delete(pageIndex);
    } else {
      newSelected.add(pageIndex);
    }
    setPagesToRemove(newSelected);
  };

  const handleRemovePages = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      // Calculate pages to KEEP
      const pagesToKeep: number[] = [];
      for (let i = 0; i < totalPages; i++) {
        if (!pagesToRemove.has(i)) {
          pagesToKeep.push(i);
        }
      }

      if (pagesToKeep.length === 0) {
        alert("You cannot remove all pages! The PDF must have at least one page.");
        setIsProcessing(false);
        return;
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pagesToKeep);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_removed_pages.pdf`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ url, filename });

    } catch (error) {
      console.error("Error removing pages:", error);
      alert("Failed to process PDF. Please try again.");
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
                <h2 className="text-2xl font-bold text-white">Pages Removed!</h2>
                <p className="text-slate-400">
                  Your new PDF is ready. The download should have started automatically.
                </p>
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
                    Process Another PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Remove PDF Pages
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Select the pages you want to remove from your PDF document.
        </p>
      </div>

      {!file ? (
      /* Upload Zone */
      <div
        {...getRootProps()}
        className={`
          relative group cursor-pointer
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
          <Trash2 size={40} strokeWidth={1.5} />
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
              <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                          <FileText size={24} />
                      </div>
                      <div>
                          <h3 className="text-white font-medium">{file.name}</h3>
                          <p className="text-slate-500 text-sm">{pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-500 hover:text-red-400 h-10 w-10 p-0">
                      <Trash2 size={20} />
                  </Button>
              </div>

              {/* Visual Selection Grid */}
              <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Click pages to remove</h3>
                    <span className="text-sm text-red-400 font-medium">{pagesToRemove.size} pages marked for removal</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-2">
                    <Document
                        file={file}
                        className="contents"
                        loading={
                            <div className="col-span-full h-32 flex items-center justify-center text-slate-500">
                                <Loader2 className="animate-spin mr-2" /> Loading thumbnails...
                            </div>
                        }
                    >
                        {Array.from(new Array(pageCount), (el, index) => (
                            <div 
                                key={`page_${index + 1}`}
                                onClick={() => togglePageRemoval(index)}
                                className={`
                                    relative aspect-[210/297] rounded-lg overflow-hidden cursor-pointer border-2 transition-all group
                                    ${pagesToRemove.has(index) ? 'border-red-500 ring-2 ring-red-500/20' : 'border-zinc-700 hover:border-slate-500'}
                                `}
                            >
                                <Page 
                                    pageNumber={index + 1} 
                                    width={150} 
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className={`w-full h-full object-contain bg-white transition-opacity ${pagesToRemove.has(index) ? 'opacity-50' : 'opacity-100'}`}
                                />
                                
                                {/* Overlay */}
                                <div className={`
                                    absolute inset-0 transition-colors flex items-center justify-center
                                    ${pagesToRemove.has(index) ? 'bg-red-500/20' : 'group-hover:bg-red-500/10'}
                                `}>
                                    {pagesToRemove.has(index) && (
                                        <div className="bg-red-500 rounded-full p-2 shadow-lg transform scale-100 transition-transform">
                                            <Trash2 size={24} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Page Number */}
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium backdrop-blur-sm">
                                    {index + 1}
                                </div>
                            </div>
                        ))}
                    </Document>
                </div>
              </div>

              {/* Action */}
              <div className="flex justify-center pt-4">
                <Button
                    size="lg"
                    onClick={handleRemovePages}
                    disabled={isProcessing || pagesToRemove.size === 0}
                    className="h-14 px-10 text-lg font-bold rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/20"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Remove Selected Pages
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
