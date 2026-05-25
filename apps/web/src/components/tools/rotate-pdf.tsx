"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { RotateCw, Loader2, ArrowDown, CheckCircle, RefreshCcw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';

// We need to import the CSS for react-pdf to render text layers properly if needed
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF worker for react-pdf
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

export default function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageRotations, setPageRotations] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setSuccessInfo(null);
      setNumPages(0);
      setPageRotations([]);
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
    setNumPages(0);
    setPageRotations([]);
    setSuccessInfo(null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageRotations(new Array(numPages).fill(0));
  };

  const rotatePage = (index: number) => {
    setPageRotations(prev => {
      const newRotations = [...prev];
      newRotations[index] = (newRotations[index] + 90) % 360;
      return newRotations;
    });
  };

  const rotateAllRight = () => {
    setPageRotations(prev => prev.map(rot => (rot + 90) % 360));
  };

  const handleApplyRotation = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        const addedRotation = pageRotations[index];
        if (addedRotation !== 0) {
          const currentRotation = page.getRotation().angle;
          // Normalize the current rotation and add the new rotation
          page.setRotation(degrees((currentRotation + addedRotation) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_rotated_${file.name}`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ url, filename });

    } catch (error) {
      console.error("Error rotating PDF:", error);
      alert("Failed to rotate PDF. Please try again.");
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
    <div className="w-full max-w-7xl mx-auto space-y-12 relative">
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
                <h2 className="text-2xl font-bold text-white">PDF Saved Successfully!</h2>
                <p className="text-sm text-slate-400">Your page rotations have been applied.</p>
              </div>

              <div className="flex flex-col gap-3">
                <a 
                    href={successInfo.url} 
                    download={successInfo.filename}
                    className="w-full"
                >
                    <Button className="w-full h-12 text-lg font-semibold bg-brand-600 hover:bg-brand-500 text-white gap-2">
                        <Download size={20} />
                        Download PDF
                    </Button>
                </a>
                <Button 
                    variant="outline" 
                    onClick={resetTool}
                    className="w-full h-12 text-lg font-medium border-zinc-700 text-slate-300 hover:bg-zinc-800 hover:text-white gap-2"
                >
                    <RefreshCcw size={20} />
                    Rotate Another
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Rotate PDF Pages
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Hover over a page to rotate it individually, or rotate all pages at once.
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
          <RotateCw size={40} strokeWidth={1.5} />
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
            className="space-y-8"
          >
              {/* Header Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 sticky top-20 z-40 backdrop-blur-md shadow-xl gap-4">
                  <div className="flex items-center gap-4">
                     <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-400 hover:text-white">
                          <RefreshCcw size={18} className="mr-2" /> Start Over
                      </Button>
                      <div className="h-6 w-px bg-zinc-700 hidden sm:block"></div>
                      <p className="text-slate-300 font-medium text-sm truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button 
                        variant="secondary" 
                        onClick={rotateAllRight} 
                        className="bg-zinc-800 hover:bg-zinc-700 text-white"
                    >
                        <RotateCw size={18} className="mr-2" /> Rotate All
                    </Button>
                    <Button
                        onClick={handleApplyRotation}
                        disabled={isProcessing}
                        className="font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg"
                    >
                        {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
                    </Button>
                  </div>
              </div>

              {/* PDF Pages Grid */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 min-h-[500px]">
                  <Document 
                    file={file} 
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex flex-wrap justify-center gap-8"
                    loading={
                      <div className="w-full flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                        <p>Loading pages...</p>
                      </div>
                    }
                  >
                    {Array.from(new Array(numPages), (el, index) => (
                      <div key={`page_${index + 1}`} className="flex flex-col items-center gap-4">
                         {/* Page Container */}
                         <div className="relative group cursor-pointer w-[200px] h-[280px] bg-white rounded-lg shadow-md overflow-hidden border-2 border-transparent hover:border-brand-500 transition-colors flex items-center justify-center">
                            
                            {/* Page Render */}
                            <motion.div
                                animate={{ rotate: pageRotations[index] || 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="flex items-center justify-center w-full h-full"
                            >
                                <Page 
                                    pageNumber={index + 1} 
                                    width={200}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="max-h-full object-contain"
                                />
                            </motion.div>

                            {/* Hover Overlay Button */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <Button 
                                    className="h-12 w-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-xl scale-90 group-hover:scale-100 transition-transform p-0 flex items-center justify-center"
                                    onClick={() => rotatePage(index)}
                                >
                                    <RotateCw size={24} />
                                </Button>
                            </div>
                            
                            {/* Rotation Badge Indicator */}
                            {pageRotations[index] !== 0 && (
                                <div className="absolute top-2 right-2 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                                    {(pageRotations[index] % 360)}°
                                </div>
                            )}
                         </div>

                         {/* Page Number Label */}
                         <div className="text-slate-400 font-medium text-sm">
                            Page {index + 1}
                         </div>
                      </div>
                    ))}
                  </Document>
              </div>

          </motion.div>
      )}
    </div>
  );
}
