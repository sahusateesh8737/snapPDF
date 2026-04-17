"use client";

import { useState, useRef } from "react";
import { FeatureCard } from "@/components/ui/feature-card";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createWorker } from "tesseract.js";
import { pdfjs } from "react-pdf";
import { PDFDocument, rgb } from "pdf-lib";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function OcrPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [extractedText, setExtractedText] = useState("");
  const [language, setLanguage] = useState("eng");
  const [ocrData, setOcrData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setExtractedText("");
      setOcrData([]);
      setProgress(0);
      setStatus("Idle");
    }
  };

  const processOcr = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus("Loading PDF...");
    setExtractedText("");
    setOcrData([]);

    try {
      if (file.type === 'application/pdf') {
          const fileBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument(fileBuffer).promise;
          const numPages = pdf.numPages;
          let fullText = "";
          const newOcrData: any[] = [];
    
          const worker = await createWorker(language);
    
          for (let i = 1; i <= numPages; i++) {
            setStatus(`Recognizing Page ${i} of ${numPages}...`);
            setProgress(((i - 1) / numPages) * 100);
    
            const page = await pdf.getPage(i);
            const scale = 2.0;
            const viewport = page.getViewport({ scale });
            
            // Render to canvas
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            if (!context) continue;
    
            canvas.height = viewport.height;
            canvas.width = viewport.width;
    
            await page.render({ canvasContext: context, viewport }).promise;
            
            // OCR
            const { data } = await worker.recognize(canvas) as any;
            const { text, words } = data;
            
            fullText += `--- Page ${i} ---\n\n${text}\n\n`;
            newOcrData.push({
                pageIndex: i,
                words: words.map((w: any) => ({
                    text: w.text,
                    bbox: w.bbox, 
                    baseline: w.baseline
                })),
                width: viewport.width,
                height: viewport.height,
                scale: scale
            });
    
            setExtractedText(fullText);
          }
    
          await worker.terminate();
          setStatus("Done!");
          setExtractedText(fullText);
          setOcrData(newOcrData);

      } else {
          // Image Logic
          setStatus("Processing Image...");
          
          const worker = await createWorker(language);
          const imgBitmap = await createImageBitmap(file);
          
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas not supported");
          
          canvas.width = imgBitmap.width;
          canvas.height = imgBitmap.height;
          context.drawImage(imgBitmap, 0, 0);
          
          const { data } = await worker.recognize(canvas) as any;
          const { text, words } = data;
          
          setExtractedText(text);
          setOcrData([{
              pageIndex: 1,
              words: words.map((w: any) => ({
                    text: w.text,
                    bbox: w.bbox, 
                    baseline: w.baseline
              })),
              width: imgBitmap.width,
              height: imgBitmap.height,
              scale: 1.0 // Image is 1:1
          }]);
          
          await worker.terminate();
          setStatus("Done!");
      }

      setProgress(100);
    } catch (error) {
      console.error("OCR Error:", error);
      setStatus("Error: " + (error as any).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert("Copied to clipboard!");
  };

  const downloadText = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file ? `${file.name.replace(".pdf", "")}_ocr.txt` : "extracted.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadPdf = async () => {
      if (!file || ocrData.length === 0) return;
      
      try {
          const fileBuffer = await file.arrayBuffer();
          // We load the original PDF to keep quality.
          // If input was image, we would create new PDF.
          
          let pdfDoc;
          if (file.type === "application/pdf") {
             pdfDoc = await PDFDocument.load(fileBuffer);
          } else {
             // For images, we would create a new PDF and embed the image.
             // For now, let's assume PDF input as primary use case.
             // If image, we need to create page.
             pdfDoc = await PDFDocument.create();
             // TODO: Handle image input properly
          }

          const pages = pdfDoc.getPages();
          
          for (let i = 0; i < ocrData.length; i++) {
              if (i >= pages.length) break;
              const page = pages[i];
              const data = ocrData[i];
              const { words, scale } = data;
              const pageHeight = page.getHeight();
              
              // Draw invisible text
              for (const word of words) {
                  const { bbox, text } = word;
                  // bbox: x0, y0, x1, y1 (in canvas coords)
                  // Canvas was rendered at scale=2.0
                  
                  const fontSize = (bbox.y1 - bbox.y0) / scale;
                  const x = bbox.x0 / scale;
                  const y = pageHeight - (bbox.y1 / scale); // PDF y is from bottom (0,0 is bottom-left)
                  
                  // Simple heuristic: PDF coords are points (1/72 inch). 
                  // Viewport returns pixels.
                  // If standard PDF, points approx pixels at 72dpi.
                  // But we use scale 2.0.
                  // Need to map canvas pixels back to PDF points.
                  // page.getWidth() / viewport.width ≈ 1 / scale ?
                  // viewport.width = page.view[2] * scale.
                  // So PDF Point = Canvas Pixel / scale.
                  // Currently doing: x / scale. This is correct if PDF points match viewport/scale.
                  
                  page.drawText(text, {
                      x: x,
                      y: y,
                      size: fontSize,
                      color: rgb(0, 0, 0),
                      opacity: 0.0 // Invisible
                  });
              }
          }
          
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name.replace(".pdf", "") + "_searchable.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
      } catch (e) {
          console.error(e);
          alert("Error generating PDF");
      }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          PDF to Text (OCR)
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Extract text from scanned PDF documents and images using advanced OCR technology.
          Processing happens entirely in your browser.
        </p>
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center justify-center space-y-6">
          
          {/* File Upload */}
          <div className="w-full max-w-md">
            <label className="block w-full cursor-pointer group">
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="application/pdf, image/*"
                className="hidden" 
              />
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl group-hover:border-brand-500/50 transition-colors bg-white/5">
                <Search className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-brand-400" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-200">
                  {file ? file.name : "Click to upload PDF or Image"}
                </span>
              </div>
            </label>
          </div>

          {/* Controls */}
          <div className="flex gap-4 items-center">
             <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black border border-zinc-700 rounded-lg px-3 py-2 text-white"
                disabled={isProcessing}
             >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
                <option value="deu">German</option>
             </select>

             <Button 
                onClick={processOcr} 
                disabled={!file || isProcessing}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold"
             >
                {isProcessing ? "Processing..." : "Start OCR"}
             </Button>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="w-full max-w-md space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                    <span>{status}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Result */}
          {extractedText && (
            <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">Extracted Text</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs">Copy</Button>
                        <Button variant="outline" size="sm" onClick={downloadText} className="text-xs">Download .txt</Button>
                        <Button variant="outline" size="sm" onClick={downloadPdf} className="text-xs text-brand-400 border-brand-500/30 hover:bg-brand-500/10">Download PDF</Button>
                    </div>
                </div>
                <textarea 
                    value={extractedText} 
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full h-96 bg-black/50 border border-zinc-800 rounded-xl p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none focus:border-brand-500/50"
                />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
