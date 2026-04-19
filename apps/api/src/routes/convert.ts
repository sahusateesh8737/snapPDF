// @ts-nocheck
import express from "express";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import * as XLSX from 'xlsx';
import PptxGenJS from "pptxgenjs";
import pdf from "pdf-parse";

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../obs/uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Shared conversion handler
const handleConversion = (req: express.Request, res: express.Response) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, "../../obs/outputs");
    
    // Create output directory
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Command to convert using LibreOffice
    // --headless: Runs without GUI
    // --convert-to pdf: Output format
    // --outdir: Output directory
    // Performance Optimization: Use unoconv to talk to the warm listener on port 2002
    // This is much faster than starting a fresh soffice instance
    // Determine output filename
    const originalName = path.parse(req.file!.filename).name;
    const expectedOutputPath = path.join(outputDir, `${originalName}.pdf`);

    // Performance Optimization: Use unoconv to talk to the warm listener on port 2002
    // Explicitly set the output filename to ensure unoconv puts it exactly where we expect
    const command = `unoconv --port 2002 -f pdf -o "${expectedOutputPath}" "${inputPath}"`;

    console.log(`Executing conversion: ${command}`);

    exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
        if (error || !fs.existsSync(expectedOutputPath)) {
            console.error("Conversion Failure Details:");
            console.error("- Error:", error);
            console.error("- Stdout:", stdout);
            console.error("- Stderr:", stderr);
            console.error("- Expected Path:", expectedOutputPath);
            console.error("- Path Exists:", fs.existsSync(expectedOutputPath));
            
            return res.status(500).json({ 
                error: "Conversion failed", 
                details: stderr || "Output file not found after command execution" 
            });
        }

        // Send file to client
        res.download(expectedOutputPath, `${originalName}.pdf`, (err) => {
            // Cleanup files after sending
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(expectedOutputPath)) fs.unlinkSync(expectedOutputPath);
            } catch (cleanupErr) {
                console.error("Cleanup error:", cleanupErr);
            }
        });
    });

};

// Routes
router.post("/word-to-pdf", upload.single("file"), handleConversion);
router.post("/ppt-to-pdf", upload.single("file"), handleConversion);
router.post("/excel-to-pdf", upload.single("file"), handleConversion);

// PDF to Word
router.post("/pdf-to-word", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, "../../obs/outputs");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    try {
        const dataBuffer = fs.readFileSync(inputPath);
        const data = await pdf(dataBuffer);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [new TextRun(data.text)],
                    }),
                ],
            }],
        });

        const originalName = path.parse(req.file.filename).name;
        const filename = `${originalName}.docx`;
        const outputPath = path.join(outputDir, filename);

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(outputPath, buffer);

        res.download(outputPath, filename, (err) => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error("PDF to Word error:", error);
        res.status(500).json({ error: "Conversion failed" });
    }
});

// PDF to PowerPoint
router.post("/pdf-to-powerpoint", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, "../../obs/outputs");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    try {
        const dataBuffer = fs.readFileSync(inputPath);
        const data = await pdf(dataBuffer);

        const pres = new PptxGenJS();
        
        // Split text by pages if possible, but pdf-parse gives one big string with page breaks usually
        // For simplicity/best-effort, we'll just put text on slides. 
        // A better approach would be to split by form-feed character if pdf-parse preserves it, 
        // or just put chunked text.
        // pdf-parse provides data.numpages and we can try to get per-page info but it's limited.
        // We'll just put all text in one slide for now or split by newlines.
        
        // Improved: Try to split by double newlines to simulate paragraphs
        const paragraphs = data.text.split('\n\n');
        let currentSlide = pres.addSlide();
        let yPos = 0.5;

        paragraphs.forEach((para, index) => {
            if (yPos > 5) {
                currentSlide = pres.addSlide();
                yPos = 0.5;
            }
            // Clean text
            const text = para.replace(/[^\x20-\x7E\n]/g, ''); // Remove non-printable chars
            if (text.trim()) {
                currentSlide.addText(text, { x: 0.5, y: yPos, w: '90%', fontSize: 12, color: '363636' });
                yPos += 1.5; // Estimate height
            }
        });

        const originalName = path.parse(req.file.filename).name;
        const filename = `${originalName}.pptx`;
        const outputPath = path.join(outputDir, filename);

        await pres.writeFile({ fileName: outputPath });

        res.download(outputPath, filename, (err) => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error("PDF to PowerPoint error:", error);
        res.status(500).json({ error: "Conversion failed" });
    }
});

// PDF to Excel
router.post("/pdf-to-excel", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, "../../obs/outputs");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    try {
        const dataBuffer = fs.readFileSync(inputPath);
        const data = await pdf(dataBuffer);

        // Very basic extraction: Split lines, treat space separated values as columns?
        // Or just put each line in a row.
        const lines = data.text.split('\n').filter(line => line.trim() !== '');
        const rows = lines.map(line => [line.trim()]); // Single column for safety

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const originalName = path.parse(req.file.filename).name;
        const filename = `${originalName}.xlsx`;
        const outputPath = path.join(outputDir, filename);

        XLSX.writeFile(wb, outputPath);

        res.download(outputPath, filename, (err) => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error("PDF to Excel error:", error);
        res.status(500).json({ error: "Conversion failed" });
    }
});

export default router;
