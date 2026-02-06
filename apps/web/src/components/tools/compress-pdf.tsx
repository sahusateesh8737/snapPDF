"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, FileText, ArrowDown, CheckCircle, RefreshCcw, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

type CompressionLevel = 'extreme' | 'recommended' | 'less';

export default function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('recommended');
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string; originalSize: number; newSize: number } | null>(null);

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
    setProgress(0);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const qualityMap = {
        'extreme': 0.4,
        'recommended': 0.6,
        'less': 0.8
      };
      
      const quality = qualityMap[compressionLevel];
      const newPdf = await PDFDocument.create();

      // We need to render each page to canvas using pdf.js, 
      // then convert to JPEG, then embed in new PDF.
      
      const fileBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(fileBuffer).promise;
      const totalPages = pdf.numPages;

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // Reasonable scale for readability

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            // Convert to JPEG with quality
            const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
            const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());
            
            // Embed in new PDF
            const jpgImage = await newPdf.embedJpg(imgBytes);
            const newPage = newPdf.addPage([viewport.width, viewport.height]);
            newPage.drawImage(jpgImage, {
                x: 0,
                y: 0,
                width: viewport.width,
                height: viewport.height,
            });
        }
        
        // Update progress
        setProgress(Math.round((i / totalPages) * 100));
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_compressed.pdf`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ 
          url, 
          filename, 
          originalSize: file.size, 
          newSize: blob.size 
      });

    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("Failed to compress PDF. Please try again.");
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
                <h2 className="text-2xl font-bold text-white">PDF Compressed!</h2>
                <div className="flex justify-center gap-4 text-sm">
                    <span className="text-slate-400">Original: <b className="text-white">{(successInfo.originalSize / 1024 / 1024).toFixed(2)} MB</b></span>
                    <span className="text-green-400">New: <b>{(successInfo.newSize / 1024 / 1024).toFixed(2)} MB</b></span>
                </div>
                <p className="text-xs text-green-500 font-mono bg-green-500/10 py-1 px-3 rounded-full inline-block">
                    Saved {((1 - successInfo.newSize / successInfo.originalSize) * 100).toFixed(0)}%
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
                    Compress Another
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Compress PDF
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Reduce PDF file size while maintaining good quality.
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
          <Zap size={40} strokeWidth={1.5} />
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
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                          <FileText size={24} />
                      </div>
                      <div>
                          <h3 className="text-white font-medium">{file.name}</h3>
                          <p className="text-slate-500 text-sm">{pageCount} Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-500 hover:text-red-400 h-10 w-10 p-0">
                      <RefreshCcw size={20} />
                  </Button>
              </div>

              {/* Compression Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                      { id: 'extreme', label: 'Extreme Compression', desc: 'Low quality, high compression', color: 'text-red-400' },
                      { id: 'recommended', label: 'Recommended', desc: 'Good quality, good compression', color: 'text-green-400' },
                      { id: 'less', label: 'Less Compression', desc: 'High quality, low compression', color: 'text-blue-400' }
                  ].map((option) => (
                      <div 
                        key={option.id}
                        onClick={() => setCompressionLevel(option.id as CompressionLevel)}
                        className={`
                            cursor-pointer p-6 rounded-xl border-2 transition-all
                            ${compressionLevel === option.id 
                                ? 'border-brand-500 bg-brand-500/10' 
                                : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700'}
                        `}
                      >
                          <div className={`text-lg font-semibold mb-1 ${compressionLevel === option.id ? 'text-white' : 'text-slate-300'}`}>
                              {option.label}
                          </div>
                          <div className="text-sm text-slate-500">{option.desc}</div>
                          {compressionLevel === option.id && (
                              <div className="mt-3 flex items-center text-brand-500 text-sm font-medium">
                                  <CheckCircle size={16} className="mr-2" /> Selected
                              </div>
                          )}
                      </div>
                  ))}
              </div>

              {/* Action */}
              <div className="flex flex-col items-center pt-4 space-y-4">
                <Button
                    size="lg"
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="h-14 px-12 text-lg font-bold rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-900/20 w-full md:w-auto"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Compressing... {progress}%
                        </>
                    ) : (
                        <>
                            Compress PDF
                            <ArrowDown className="ml-3 h-5 w-5" />
                        </>
                    )}
                </Button>
                
                {isProcessing && (
                    <div className="w-full max-w-md bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <motion.div 
                            className="h-full bg-brand-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                )}
              </div>

          </motion.div>
      )}

    </div>
  );
}
