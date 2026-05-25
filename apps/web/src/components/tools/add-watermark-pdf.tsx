"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Stamp, Loader2, FileText, ArrowDown, CheckCircle, RefreshCcw, Download, Image as ImageIcon, Type } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type WatermarkStyle = "diagonal" | "centered";
type WatermarkType = "text" | "image";

export default function AddWatermarkTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ url: string; filename: string } | null>(null);

  // Configuration State
  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [style, setStyle] = useState<WatermarkStyle>("diagonal");

  const imageInputRef = useRef<HTMLInputElement>(null);

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
    setWatermarkImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setWatermarkImage(e.target.files[0]);
    }
  };

  const handleApplyWatermark = async () => {
    if (!file) return;
    if (watermarkType === "text" && !watermarkText.trim()) {
      alert("Please enter watermark text.");
      return;
    }
    if (watermarkType === "image" && !watermarkImage) {
      alert("Please upload an image to use as a watermark.");
      return;
    }
    
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      let helveticaFont;
      let imageObj;
      let imgDims = { width: 0, height: 0 };

      // Pre-load resources depending on type
      if (watermarkType === "text") {
          helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      } else if (watermarkType === "image" && watermarkImage) {
          const imageBuffer = await watermarkImage.arrayBuffer();
          if (watermarkImage.type === "image/png") {
              imageObj = await pdfDoc.embedPng(imageBuffer);
          } else if (watermarkImage.type === "image/jpeg" || watermarkImage.type === "image/jpg") {
              imageObj = await pdfDoc.embedJpg(imageBuffer);
          } else {
              throw new Error("Unsupported image format. Please use PNG or JPG.");
          }
          imgDims = imageObj.scale(0.5); // Scale down by default
      }

      const textSize = 64;

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        if (watermarkType === "text" && helveticaFont) {
            const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, textSize);

            if (style === "diagonal") {
              const angle = Math.atan(height / width);
              const x = width / 2 - (textWidth / 2) * Math.cos(angle);
              const y = height / 2 - (textWidth / 2) * Math.sin(angle);

              page.drawText(watermarkText, {
                x, y,
                size: textSize,
                font: helveticaFont,
                color: rgb(0.5, 0.5, 0.5),
                opacity: 0.3,
                rotate: degrees(angle * (180 / Math.PI)),
              });
            } else {
              const x = width / 2 - textWidth / 2;
              const y = height / 2 - textSize / 2;

              page.drawText(watermarkText, {
                x, y,
                size: textSize,
                font: helveticaFont,
                color: rgb(0.5, 0.5, 0.5),
                opacity: 0.3,
              });
            }
        } 
        else if (watermarkType === "image" && imageObj) {
            // Limit image width to max 80% of page width
            let finalWidth = imgDims.width;
            let finalHeight = imgDims.height;
            const maxWidth = width * 0.8;
            if (finalWidth > maxWidth) {
               const scaleRatio = maxWidth / finalWidth;
               finalWidth = maxWidth;
               finalHeight = finalHeight * scaleRatio;
            }

            if (style === "diagonal") {
              const angle = Math.atan(height / width);
              const x = width / 2 - (finalWidth / 2) * Math.cos(angle) + (finalHeight / 2) * Math.sin(angle);
              const y = height / 2 - (finalWidth / 2) * Math.sin(angle) - (finalHeight / 2) * Math.cos(angle);

              page.drawImage(imageObj, {
                x, y,
                width: finalWidth,
                height: finalHeight,
                opacity: 0.3,
                rotate: degrees(angle * (180 / Math.PI)),
              });
            } else {
              const x = width / 2 - finalWidth / 2;
              const y = height / 2 - finalHeight / 2;

              page.drawImage(imageObj, {
                x, y,
                width: finalWidth,
                height: finalHeight,
                opacity: 0.3,
              });
            }
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const filename = `snapPDF_watermarked_${file.name}`;
      
      triggerDownload(url, filename);
      setSuccessInfo({ url, filename });

    } catch (error: any) {
      console.error("Error adding watermark:", error);
      alert(error.message || "Failed to add watermark. Please try again.");
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
                <h2 className="text-2xl font-bold text-white">Watermark Added!</h2>
                <p className="text-sm text-slate-400">Your document has been securely watermarked.</p>
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
          Add Watermark
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Stamp an image or text over your PDF in seconds to protect your documents.
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
          <Stamp size={40} strokeWidth={1.5} />
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

              {/* Type Selection */}
              <div className="flex justify-center mb-6">
                <div className="bg-zinc-950/50 p-1.5 rounded-full border border-zinc-800 flex w-full max-w-sm">
                   <button
                     onClick={() => setWatermarkType("text")}
                     className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${watermarkType === "text" ? "bg-zinc-800 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
                   >
                     <Type size={16} /> Text
                   </button>
                   <button
                     onClick={() => setWatermarkType("image")}
                     className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-all ${watermarkType === "image" ? "bg-zinc-800 text-white shadow-md" : "text-slate-400 hover:text-slate-200"}`}
                   >
                     <ImageIcon size={16} /> Image
                   </button>
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Content Setting */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Watermark Content</h4>
                      
                      {watermarkType === "text" ? (
                         <input 
                            type="text"
                            value={watermarkText}
                            onChange={(e) => setWatermarkText(e.target.value)}
                            placeholder="e.g., CONFIDENTIAL"
                            className="w-full bg-zinc-950/50 border-2 border-zinc-800 focus:border-brand-500 rounded-xl px-4 py-4 text-white font-medium outline-none transition-colors"
                         />
                      ) : (
                         <div className="space-y-3">
                           <input 
                              type="file" 
                              accept="image/png, image/jpeg, image/jpg" 
                              className="hidden" 
                              ref={imageInputRef}
                              onChange={handleImageUpload}
                           />
                           <div 
                              onClick={() => imageInputRef.current?.click()}
                              className="w-full bg-zinc-950/50 border-2 border-dashed border-zinc-700 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2"
                           >
                              {watermarkImage ? (
                                <>
                                  <ImageIcon size={32} className="text-brand-500" />
                                  <p className="text-white font-medium truncate w-full px-4">{watermarkImage.name}</p>
                                  <p className="text-xs text-slate-500">Click to replace</p>
                                </>
                              ) : (
                                <>
                                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-slate-400 mb-2">
                                     <ImageIcon size={20} />
                                  </div>
                                  <p className="text-slate-300 font-medium">Upload Image</p>
                                  <p className="text-xs text-slate-500">PNG or JPG logo</p>
                                </>
                              )}
                           </div>
                         </div>
                      )}
                  </div>

                  {/* Style Setting */}
                  <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-white">Style</h4>
                      <div className="grid grid-cols-2 gap-3">
                          {[
                              { id: "diagonal", label: "Diagonal", desc: "Spans across the page" },
                              { id: "centered", label: "Centered", desc: "Horizontal in the middle" },
                          ].map((pos) => (
                              <div
                                  key={pos.id}
                                  onClick={() => setStyle(pos.id as WatermarkStyle)}
                                  className={`
                                      flex flex-col justify-center items-center cursor-pointer p-4 rounded-xl border-2 text-center transition-all
                                      ${style === pos.id 
                                          ? 'border-brand-500 bg-brand-500/10 text-white' 
                                          : 'border-zinc-800 bg-zinc-950/50 text-slate-400 hover:border-zinc-700 hover:text-slate-200'}
                                  `}
                              >
                                  <span className="font-semibold">{pos.label}</span>
                                  <span className="text-xs opacity-70 mt-1">{pos.desc}</span>
                              </div>
                          ))}
                      </div>
                  </div>

              </div>

              {/* Action */}
              <div className="flex flex-col items-center pt-8 border-t border-zinc-800">
                <Button
                    size="lg"
                    onClick={handleApplyWatermark}
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
                            Add Watermark
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
