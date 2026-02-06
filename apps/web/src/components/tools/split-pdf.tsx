"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { FileUp, Trash2, ArrowDown, Loader2, FileText, Scissors, CheckCircle, RefreshCcw, Download, Layers, Grid2X2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);
  const [splitMode, setSplitMode] = useState<'extract_all' | 'custom_range' | 'visual_select'>('extract_all');
  const [customRange, setCustomRange] = useState("");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setSuccessInfo(null);
      
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
    setCustomRange("");
    setSplitMode('extract_all');
    setSelectedPages(new Set());
  };

  const togglePageSelection = (pageIndex: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageIndex)) {
      newSelected.delete(pageIndex);
    } else {
      newSelected.add(pageIndex);
    }
    setSelectedPages(newSelected);
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const totalPages = pdfDoc.getPageCount();

      if (splitMode === 'extract_all') {
        const zip = new JSZip();
        
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          zip.file(`Page_${i + 1}.pdf`, pdfBytes);
        }

        const zipContent = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipContent);
        const filename = `snapPDF_split_all.zip`;
        triggerDownload(url, filename);
        setSuccessInfo({ url, filename });

      } else if (splitMode === 'custom_range') {
        const pagesToExtract = parsePageRange(customRange, totalPages);
        if (pagesToExtract.length === 0) {
            alert("Invalid page range.");
            setIsProcessing(false);
            return;
        }
        await extractPages(pdfDoc, pagesToExtract, 'snapPDF_split_custom.pdf');

      } else if (splitMode === 'visual_select') {
        const pagesToExtract = Array.from(selectedPages).sort((a, b) => a - b);
        if (pagesToExtract.length === 0) {
            alert("Please select at least one page.");
            setIsProcessing(false);
            return;
        }
        await extractPages(pdfDoc, pagesToExtract, 'snapPDF_selected_pages.pdf');
      }

    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Failed to split PDF. Please check the file and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const extractPages = async (sourceDoc: PDFDocument, pageIndices: number[], filename: string) => {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourceDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    triggerDownload(url, filename);
    setSuccessInfo({ url, filename });
  };

  const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const parsePageRange = (rangeStr: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = rangeStr.split(',').map(p => p.trim());

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= maxPages) pages.add(i - 1);
                }
            }
        } else {
            const num = parseInt(part);
            if (!isNaN(num) && num >= 1 && num <= maxPages) {
                pages.add(num - 1);
            }
        }
    }
    return Array.from(pages).sort((a, b) => a - b);
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
                <h2 className="text-2xl font-bold text-white">PDF Split Successfully!</h2>
                <p className="text-slate-400">
                  Your document is ready. The download should have started automatically.
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
                    Split Another PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Split PDF File
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Separate one page or a whole set for easy conversion into independent PDF files.
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
          <Scissors size={40} strokeWidth={1.5} />
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
                  <Button variant="ghost" size="icon" onClick={resetTool} className="text-slate-500 hover:text-red-400">
                      <Trash2 size={20} />
                  </Button>
              </div>

              {/* Configure Split */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Option 1: Extract All */}
                <div 
                    onClick={() => setSplitMode('extract_all')}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${splitMode === 'extract_all' ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${splitMode === 'extract_all' ? 'border-brand-500' : 'border-zinc-600'}`}>
                            {splitMode === 'extract_all' && <div className="w-3 h-3 bg-brand-500 rounded-full" />}
                        </div>
                        <h3 className="text-white font-semibold">Extract All</h3>
                    </div>
                    <p className="text-slate-400 text-sm pl-10">
                        Save every page as a separate PDF file (ZIP download).
                    </p>
                </div>

                {/* Option 2: Custom Range */}
                <div 
                    onClick={() => setSplitMode('custom_range')}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${splitMode === 'custom_range' ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${splitMode === 'custom_range' ? 'border-brand-500' : 'border-zinc-600'}`}>
                            {splitMode === 'custom_range' && <div className="w-3 h-3 bg-brand-500 rounded-full" />}
                        </div>
                        <h3 className="text-white font-semibold">Custom Range</h3>
                    </div>
                    <p className="text-slate-400 text-sm pl-10 mb-4">
                        Type page numbers to extract (e.g. 1-5, 8).
                    </p>
                    
                    {splitMode === 'custom_range' && (
                        <div className="pl-10">
                            <Input 
                                placeholder="e.g. 1-5, 8"
                                value={customRange}
                                onChange={(e) => setCustomRange(e.target.value)}
                                className="mt-2 bg-zinc-900 border-zinc-700 focus:border-brand-500 text-white"
                            />
                        </div>
                    )}
                </div>

                {/* Option 3: Select Pages */}
                <div 
                    onClick={() => setSplitMode('visual_select')}
                    className={`cursor-pointer border-2 rounded-2xl p-6 transition-all ${splitMode === 'visual_select' ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}`}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${splitMode === 'visual_select' ? 'border-brand-500' : 'border-zinc-600'}`}>
                            {splitMode === 'visual_select' && <div className="w-3 h-3 bg-brand-500 rounded-full" />}
                        </div>
                        <h3 className="text-white font-semibold">Select Pages</h3>
                    </div>
                    <p className="text-slate-400 text-sm pl-10">
                        Click thumbnails to select specific pages to extract.
                    </p>
                </div>

              </div>

              {/* Visual Selection Grid */}
              {splitMode === 'visual_select' && file && (
                <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-semibold">Select Pages to Extract</h3>
                        <span className="text-sm text-brand-400 font-medium">{selectedPages.size} pages selected</span>
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
                                    onClick={() => togglePageSelection(index)}
                                    className={`
                                        relative aspect-[210/297] rounded-lg overflow-hidden cursor-pointer border-2 transition-all group
                                        ${selectedPages.has(index) ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-zinc-700 hover:border-slate-500'}
                                    `}
                                >
                                    <Page 
                                        pageNumber={index + 1} 
                                        width={150} 
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        className="w-full h-full object-contain bg-white"
                                    />
                                    
                                    {/* Overlay */}
                                    <div className={`
                                        absolute inset-0 transition-colors flex items-center justify-center
                                        ${selectedPages.has(index) ? 'bg-brand-500/20' : 'group-hover:bg-white/10'}
                                    `}>
                                        {selectedPages.has(index) && (
                                            <div className="bg-brand-500 rounded-full p-1 shadow-lg transform scale-100 transition-transform">
                                                <Check size={16} className="text-white" />
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
              )}

              {/* Action */}
              <div className="flex justify-center pt-4">
                <Button
                    size="lg"
                    onClick={handleSplit}
                    disabled={isProcessing || (splitMode === 'custom_range' && !customRange) || (splitMode === 'visual_select' && selectedPages.size === 0)}
                    className="h-14 px-10 text-lg font-bold rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-900/20"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Split PDF
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
