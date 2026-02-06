"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { 
  Layout, 
  Loader2, 
  FileText, 
  ArrowDown, 
  CheckCircle, 
  RefreshCcw, 
  Download, 
  Trash2, 
  RotateCw,
  GripHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from 'react-pdf';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Configure PDF worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PageItem {
  id: string; // unique id for dnd
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
}

interface SortablePageProps {
  id: string;
  pageIndex: number; // 0-based index of the *original* page to render
  rotation: number;
  pageNumberDisplay: number;
  onRotate: () => void;
  onDelete: () => void;
}

function SortablePage({ id, pageIndex, rotation, pageNumberDisplay, onRotate, onDelete }: SortablePageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative bg-zinc-900 rounded-lg border border-zinc-700 overflow-hidden hover:border-brand-500 transition-colors ${isDragging ? "opacity-50" : ""}`}
    >
        {/* Drag Handle */}
        <div 
            {...attributes} 
            {...listeners}
            className="absolute top-2 left-2 z-20 p-1.5 bg-black/60 rounded-md text-white cursor-grab active:cursor-grabbing hover:bg-black/80"
        >
            <GripHorizontal size={16} />
        </div>

        {/* Controls */}
        <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); onRotate(); }}
                className="p-1.5 bg-black/60 rounded-md text-white hover:bg-brand-600 hover:text-white transition-colors"
                title="Rotate Clockwise"
            >
                <RotateCw size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 bg-black/60 rounded-md text-white hover:bg-red-600 hover:text-white transition-colors"
                title="Delete Page"
            >
                <Trash2 size={16} />
            </button>
        </div>

        {/* Page Thumbnail */}
        <div className="p-2 flex items-center justify-center bg-zinc-800/50 h-full min-h-[160px]">
            <div 
                className="relative shadow-lg transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
            >
                <Page 
                    pageNumber={pageIndex + 1} 
                    width={120} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="object-contain bg-white"
                />
            </div>
        </div>

        {/* Page Number */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium backdrop-blur-sm z-10">
            {pageNumberDisplay}
        </div>
    </div>
  );
}

export default function OrganizePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [items, setItems] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setSuccessInfo(null);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);

        // Initialize items
        const newItems: PageItem[] = [];
        for (let i = 0; i < count; i++) {
            newItems.push({
                id: `page-${i}`,
                originalIndex: i,
                rotation: 0
            });
        }
        setItems(newItems);

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
    setItems([]);
    setSuccessInfo(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRotate = (id: string) => {
      setItems(items => items.map(item => {
          if (item.id === id) {
              return { ...item, rotation: (item.rotation + 90) % 360 };
          }
          return item;
      }));
  };

  const handleDelete = (id: string) => {
      setItems(items => items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const newPdf = await PDFDocument.create();

      // items array represents the new order
      // We need to copy pages based on item.originalIndex
      // AND apply item.rotation
    
      // Get indices to copy
      const indicesToCopy = items.map(item => item.originalIndex);
      
      // Copy pages
      const copiedPages = await newPdf.copyPages(pdfDoc, indicesToCopy);

      // Add pages to new PDF and apply rotation
      copiedPages.forEach((page, index) => {
          const item = items[index];
          const existingRotation = page.getRotation().angle;
          page.setRotation(degrees(existingRotation + item.rotation));
          newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_organized.pdf`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ url, filename });

    } catch (error) {
      console.error("Error organizing PDF:", error);
      alert("Failed to process PDF.");
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
    <div className="w-full max-w-6xl mx-auto space-y-12 relative">
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
                <h2 className="text-2xl font-bold text-white">PDF Organized!</h2>
                <p className="text-slate-400">
                  Your new PDF document is ready.
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
                    Start Over
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Organize PDF
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Sort, add, rotate, and delete PDF pages.
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
          <Layout size={40} strokeWidth={1.5} />
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
                      <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center">
                          <FileText size={24} />
                      </div>
                      <div>
                          <h3 className="text-white font-medium">{file.name}</h3>
                          <p className="text-slate-500 text-sm">{pageCount} Original Pages • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={resetTool} className="text-slate-500 hover:text-red-400 h-10 w-10 p-0">
                      <RefreshCcw size={20} />
                  </Button>
              </div>

              {/* Grid Area */}
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                  <div className="bg-zinc-950/50 rounded-2xl border border-zinc-800 p-6 min-h-[400px]">
                     {items.length === 0 ? (
                         <div className="flex items-center justify-center h-full text-slate-500">
                             All pages deleted.
                         </div>
                     ) : (
                        <SortableContext 
                            items={items.map(i => i.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                <Document file={file} className="contents">
                                    {items.map((item, index) => (
                                        <SortablePage 
                                            key={item.id}
                                            id={item.id}
                                            pageIndex={item.originalIndex}
                                            rotation={item.rotation}
                                            pageNumberDisplay={index + 1}
                                            onRotate={() => handleRotate(item.id)}
                                            onDelete={() => handleDelete(item.id)}
                                        />
                                    ))}
                                </Document>
                            </div>
                        </SortableContext>
                     )}
                  </div>
              </DndContext>

              {/* Action */}
              <div className="flex flex-col items-center pt-4">
                <Button
                    size="lg"
                    onClick={handleSave}
                    disabled={isProcessing || items.length === 0}
                    className="h-14 px-12 text-lg font-bold rounded-full bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-900/20"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Save Changes
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
