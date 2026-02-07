"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { 
  Presentation, 
  Loader2, 
  ArrowDown, 
  CheckCircle, 
  RefreshCcw, 
  Download, 
  AlertCircle,
  X,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function PdfToPowerPointTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setSuccessInfo(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const resetTool = () => {
    setFile(null);
    setSuccessInfo(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/convert/pdf-to-powerpoint`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const filename = file.name.replace(/\.pdf$/i, '.pptx');

      // Trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();

      setSuccessInfo({ url, filename });

    } catch (err: any) {
      console.error("Error creating PowerPoint:", err);
      setError(err.message || "Failed to convert file. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 relative px-4">
       {/* Back Button */}
       <div className="absolute -top-16 left-0">
        <Link href="/">
          <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 px-2">
            <ChevronLeft size={20} />
            Back to Tools
          </Button>
        </Link>
      </div>

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
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center relative"
            >
              <button 
                onClick={resetTool}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                <CheckCircle size={48} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">PDF Converted!</h2>
                <p className="text-slate-400">
                  Your PowerPoint presentation is ready.
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
                    variant="secondary" 
                    onClick={resetTool}
                    className="w-full h-12 text-lg font-medium bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 gap-2"
                >
                    <RefreshCcw size={20} />
                    Convert Another
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          PDF to PowerPoint
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Convert your PDF to editable PowerPoint slides.
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
            <Presentation size={40} strokeWidth={1.5} />
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
          {error && (
            <div className="flex items-center gap-2 text-red-400 justify-center bg-red-950/20 p-3 rounded-lg border border-red-900/50">
                <AlertCircle size={18} />
                <p>{error}</p>
            </div>
          )}
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
                      <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center">
                          <Presentation size={24} />
                      </div>
                      <div>
                          <h3 className="text-white font-medium">{file.name}</h3>
                          <p className="text-slate-500 text-sm">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-500 hover:text-red-400 h-10 w-10 p-0">
                      <RefreshCcw size={20} />
                  </Button>
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
                            Converting on Server...
                        </>
                    ) : (
                        <>
                            Convert to PowerPoint
                            <ArrowDown className="ml-3 h-5 w-5" />
                        </>
                    )}
                </Button>
                <p className="text-xs text-slate-500 mt-4">
                    Files are processed securely and deleted immediately after conversion.
                </p>
              </div>

          </motion.div>
      )}

    </div>
  );
}
