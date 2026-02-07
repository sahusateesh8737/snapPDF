"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { 
  Image as ImageIcon, 
  Loader2, 
  FileImage, 
  ArrowDown, 
  CheckCircle, 
  RefreshCcw, 
  Download, 
  Trash2, 
  GripHorizontal,
  Plus,
  X,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

interface ImageItem {
  id: string;
  file: File;
  preview: string;
}

interface SortableImageProps {
  id: string;
  item: ImageItem;
  onDelete: () => void;
}

function SortableImage({ id, item, onDelete }: SortableImageProps) {
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
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 bg-black/60 rounded-md text-white hover:bg-red-600 hover:text-white transition-colors"
                title="Delete Image"
            >
                <Trash2 size={16} />
            </button>
        </div>

        {/* Image Preview */}
        <div className="aspect-[3/4] p-2 flex items-center justify-center bg-zinc-800/50">
            <img 
                src={item.preview} 
                alt={item.file.name}
                className="w-full h-full object-contain rounded-sm"
            />
        </div>

        {/* File Name */}
        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate backdrop-blur-sm z-10">
            {item.file.name}
        </div>
    </div>
  );
}

export default function JpgToPdfTool() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
    }));
    setItems(prev => [...prev, ...newItems]);
    setSuccessInfo(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
        'image/*': [] 
    },
    maxFiles: 50,
  });

  // Cleanup previews
  useEffect(() => {
    return () => items.forEach(item => URL.revokeObjectURL(item.preview));
  }, [items]);

  const resetTool = () => {
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

  const handleDelete = (id: string) => {
      setItems(items => items.filter(item => item.id !== id));
  };

  const convertImageToPng = async (file: File): Promise<ArrayBuffer> => {
      return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                  reject(new Error("Could not get canvas context"));
                  return;
              }
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                  if (blob) {
                      blob.arrayBuffer().then(resolve).catch(reject);
                  } else {
                      reject(new Error("Canvas to Blob failed"));
                  }
              }, 'image/png');
          };
          img.onerror = (err) => reject(err);
          img.src = URL.createObjectURL(file);
      });
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const item of items) {
          let image;
          
          try {
             // Try direct embedding for standard formats to preserve quality/speed
             const arrayBuffer = await item.file.arrayBuffer();
             if (item.file.type === 'image/jpeg') {
                 image = await pdfDoc.embedJpg(arrayBuffer);
             } else if (item.file.type === 'image/png') {
                 image = await pdfDoc.embedPng(arrayBuffer);
             } else {
                 // Convert unsupported formats (webp, gif, bmp, etc) to PNG
                 throw new Error("Unsupported format, triggering fallback");
             }
          } catch (e) {
             // Fallback: Convert to PNG via Canvas
             const pngBuffer = await convertImageToPng(item.file);
             image = await pdfDoc.embedPng(pngBuffer);
          }

          if (image) {
              const page = pdfDoc.addPage([image.width, image.height]);
              page.drawImage(image, {
                  x: 0,
                  y: 0,
                  width: image.width,
                  height: image.height,
              });
          }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_converted.pdf`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ url, filename });

    } catch (error) {
      console.error("Error converting images to PDF:", error);
      alert("Failed to create PDF. Some images might be corrupted.");
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
                <h2 className="text-2xl font-bold text-white">Images Converted!</h2>
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
                    variant="secondary" 
                    onClick={resetTool}
                    className="w-full h-12 text-lg font-medium bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 gap-2"
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
          IMG to PDF
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Convert your images to a single PDF document. Supports JPG and PNG.
        </p>
      </div>

      {/* Main Area */}
      <div className="space-y-8">
          {/* Upload Area / Add More */}
          <div
            {...getRootProps()}
            className={`
              relative group cursor-pointer
              border-2 border-dashed rounded-3xl p-8
              transition-all duration-300 ease-in-out
              flex flex-col items-center justify-center text-center gap-4
              ${items.length === 0 ? "p-12 min-h-[300px]" : "h-32 flex-row border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900"}
              ${isDragActive 
                ? "border-brand-500 bg-brand-500/10" 
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"}
            `}
          >
            <input {...getInputProps()} />
            
            {items.length === 0 ? (
                <>
                    <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${isDragActive ? "bg-brand-500 text-white" : "bg-zinc-800 text-brand-500 group-hover:bg-brand-500 group-hover:text-white shadow-xl"}
                    `}>
                        <ImageIcon size={32} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xl font-semibold text-white">
                            {isDragActive ? "Drop images here" : "Select Images"}
                        </p>
                        <p className="text-sm text-slate-500">
                            JPG or PNG only
                        </p>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-4 text-slate-400 group-hover:text-white transition-colors">
                    <Plus size={32} />
                    <span className="text-lg font-medium">Add more images</span>
                </div>
            )}
          </div>

          {/* Grid Area */}
          {items.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 min-h-[200px]"
            >
                <div className="flex justify-between items-center mb-6 px-2">
                     <h3 className="text-white font-semibold flex items-center gap-2">
                        <FileImage size={18} className="text-brand-500" />
                        {items.length} Images
                     </h3>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={resetTool} 
                        className="text-slate-500 hover:text-red-400"
                    >
                        Clear All
                    </Button>
                </div>

                <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={items.map(i => i.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {items.map((item) => (
                                <SortableImage 
                                    key={item.id}
                                    id={item.id}
                                    item={item}
                                    onDelete={() => handleDelete(item.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Convert Button */}
                <div className="flex justify-center pt-8">
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
                                Convert to PDF
                                <ArrowDown className="ml-3 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
          )}
      </div>
    </div>
  );
}
