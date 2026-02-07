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
        cb(null, `${Date.now()}-${file.originalname}`);
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
    const command = `soffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("Conversion error:", error);
            console.error("Stderr:", stderr);
            return res.status(500).json({ error: "Conversion failed", details: stderr });
        }

        // Determine output filename
        // LibreOffice keeps the original filename but changes extension
        const originalName = path.parse(req.file!.filename).name;
        // LibreOffice might replace spaces or special chars, but usually it matches
        // For safety, let's find the created file in the directory
        const expectedOutputPath = path.join(outputDir, `${originalName}.pdf`);
        
        // Fallback: mostly naming is consistent, but if safe filename used, check
        
        if (fs.existsSync(expectedOutputPath)) {
            // Send file to client
            res.download(expectedOutputPath, `${originalName}.pdf`, (err) => {
                // Cleanup files after sending
                try {
                    fs.unlinkSync(inputPath); // Delete upload
                    // We might not want to delete output immediately if download fails, 
                    // but for now let's cleanup to save space.
                    fs.unlinkSync(expectedOutputPath); // Delete output
                } catch (cleanupErr) {
                    console.error("Cleanup error:", cleanupErr);
                }
            });
        } else {
             // Try to find any pdf created in the last few seconds if exact match fails?
             // For now, return error
            res.status(500).json({ error: "Output file not found" });
        }
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
