"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon,
  Loader2, 
  ArrowDown, 
  CheckCircle, 
  RefreshCcw, 
  Download, 
  Trash2,
  X,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import JSZip from "jszip";

// Configure PDF worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ id: string; blob: Blob; url: string; name: string }[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isConverted, setIsConverted] = useState(false);

  // Cleanup object URLs on unmount or reset
  useEffect(() => {
    return () => {
      generatedImages.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [generatedImages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setIsConverted(false);
      setGeneratedImages([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setPageCount(numPages);
  };

  const resetTool = () => {
    setFile(null);
    setIsConverted(false);
    setGeneratedImages([]);
    setPageCount(0);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setGeneratedImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const newImages: { id: string; blob: Blob; url: string; name: string }[] = [];

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality scale
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
           await page.render({
            canvasContext: context,
            viewport: viewport
           }).promise;

           const blob = await new Promise<Blob | null>(resolve => 
             canvas.toBlob(resolve, 'image/jpeg', 0.9)
           );

           if (blob) {
             const name = `page_${i}.jpg`;
             const url = URL.createObjectURL(blob);
             newImages.push({
                 id: Math.random().toString(36).substr(2, 9),
                 blob,
                 url,
                 name
             });
           }
        }
      }

      setGeneratedImages(newImages);
      setIsConverted(true);

    } catch (error) {
      console.error("Error converting PDF to JPG:", error);
      alert("Failed to convert PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadZip = async () => {
      if (generatedImages.length === 0) return;
      
      const zip = new JSZip();
      generatedImages.forEach(img => {
          zip.file(img.name, img.blob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "snapPDF_images.zip";
      link.click();
      URL.revokeObjectURL(url);
  };

  const downloadImage = (img: { url: string; name: string }) => {
      const link = document.createElement("a");
      link.href = img.url;
      link.download = img.name;
      link.click();
  };

  const downloadAllSeparately = () => {
      generatedImages.forEach((img, index) => {
          setTimeout(() => {
              downloadImage(img);
          }, index * 300); // 300ms delay to prevent freezing/blocking
      });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 relative px-4">
       {/* Back Button */}
       <div className="absolute -top-16 left-0">
        <Link href="/">
          <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 px-2">
            <ChevronLeft size={20} />
            Back to Tools
          </Button>
        </Link>
      </div>

       {/* Success Modal - Replaced with Inline result for better UX with multiple downloads */}
       <AnimatePresence>
        {isConverted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
             <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4">
                <CheckCircle size={24} />
                <div>
                    <h4 className="font-bold">Conversion Complete!</h4>
                    <p className="text-sm text-green-100">{generatedImages.length} images ready to download.</p>
                </div>
                <button onClick={() => setIsConverted(false)} className="ml-4 hover:bg-green-700 p-1 rounded">
                    <X size={18} />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          PDF to JPG
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Convert each page of your PDF into high-quality JPG images.
        </p>
      </div>

      {!file ? (
      /* Upload Zone */
      <div className="space-y-4">
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
            <ImageIcon size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
            <p className="text-xl font-semibold text-white">
                {isDragActive ? "Drop PDF file here" : "Select PDF file"}
            </p>
            <p className="text-sm text-slate-500">
                .pdf files only
            </p>
            </div>
            <Button 
            size="lg"
            className="bg-brand-600 hover:bg-brand-500 text-white mt-4 pointer-events-none"
            >
            Select PDF File
            </Button>
          </div>
      </div>
      ) : (
          /* Editor / Preview Zone */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-8"
          >
              {/* File Info */}
              <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center">
                          <ImageIcon size={24} />
                      </div>
                      <div>
                          <h3 className="text-white font-medium">{file.name}</h3>
                          <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-500 hover:text-red-400 h-10 w-10 p-0">
                      <Trash2 size={20} />
                  </Button>
              </div>

              {/* Converted Images Grid */}
              {generatedImages.length > 0 ? (
                  <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                          <h3 className="text-white font-semibold text-xl">Converted Images ({generatedImages.length})</h3>
                          <div className="flex gap-3">
                              <Button 
                                onClick={downloadZip}
                                className="bg-brand-600 hover:bg-brand-500 text-white gap-2"
                              >
                                  <Download size={18} />
                                  Download All (ZIP)
                              </Button>
                              <Button 
                                onClick={downloadAllSeparately}
                                variant="outline"
                                className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-brand-400 gap-2 font-semibold"
                              >
                                  <Download size={18} />
                                  Separate All Pages
                              </Button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {generatedImages.map((img) => (
                                <div key={img.id} className="group relative bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 hover:border-brand-500 transition-colors">
                                    <div className="aspect-[210/297] p-2">
                                        <img src={img.url} alt={img.name} className="w-full h-full object-contain rounded-md" />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform flex flex-col gap-2">
                                        <p className="text-xs text-white truncate font-medium">{img.name}</p>
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={() => downloadImage(img)}
                                            className="w-full h-8 text-xs bg-blue-500  text-white hover:bg-blue-400"
                                        >
                                            <Download size={14} className="mr-1" /> Download
                                        </Button>
                                    </div>
                                </div>
                            ))}
                      </div>

                      <div className="flex justify-center pt-8">
                         <Button 
                            variant="outline" 
                            onClick={resetTool}
                            className="border-zinc-700 text-slate-300 hover:bg-zinc-800 hover:text-white gap-2"
                        >
                            <RefreshCcw size={18} />
                            Convert Another File
                        </Button>
                      </div>
                  </div>
              ) : (
                /* Pre-conversion Preview */
                 <>
                    <div className="space-y-4">
                        <h3 className="text-white font-semibold flex justify-between">
                            <span>Preview</span>
                            <span className="text-slate-500 text-sm">Convert to see all pages</span>
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            <Document
                                file={file}
                                onLoadSuccess={onDocumentLoadSuccess}
                                className="contents"
                                loading={
                                    <div className="col-span-full h-20 flex items-center justify-center text-slate-500">
                                        <Loader2 className="animate-spin mr-2" /> Loading preview...
                                    </div>
                                }
                            >
                                {Array.from(new Array(Math.min(pageCount, 5)), (el, index) => (
                                    <div key={`page_${index + 1}`} className="relative aspect-[210/297] bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                        <Page 
                                            pageNumber={index + 1} 
                                            width={200} 
                                            className="w-full h-full object-contain"
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                        />
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))}
                            </Document>
                        </div>
                        {pageCount > 5 && (
                            <p className="text-center text-slate-500 text-sm mt-4">
                                + {pageCount - 5} more pages
                            </p>
                        )}
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-center pt-8">
                        <Button
                            size="lg"
                            onClick={handleConvert}
                            disabled={isProcessing}
                            className="h-14 px-12 text-lg font-bold rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-900/20"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                <>
                                    Convert to JPG Images
                                    <ArrowDown className="ml-3 h-5 w-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </>
              )}
          </motion.div>
      )}

    </div>
  );
}
