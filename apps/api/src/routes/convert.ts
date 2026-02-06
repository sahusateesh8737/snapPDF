import express from "express";
import multer from "multer";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

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

router.post("/word-to-pdf", upload.single("file"), (req, res) => {
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
        const outputPath = path.join(outputDir, `${originalName}.pdf`);

        if (fs.existsSync(outputPath)) {
            // Send file to client
            res.download(outputPath, `${originalName}.pdf`, (err) => {
                // Cleanup files after sending
                try {
                    fs.unlinkSync(inputPath); // Delete upload
                    // We might not want to delete output immediately if download fails, 
                    // but for now let's cleanup to save space.
                    // Ideally, use a cron job or delete after callback.
                    fs.unlinkSync(outputPath); // Delete output
                } catch (cleanupErr) {
                    console.error("Cleanup error:", cleanupErr);
                }
            });
        } else {
            res.status(500).json({ error: "Output file not found" });
        }
    });
});

export default router;
