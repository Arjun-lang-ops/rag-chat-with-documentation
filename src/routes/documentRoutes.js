import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { uploadDocument, listDocuments, deleteDocument, getDocumentChunks } from "../controllers/documentController.js";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, callback) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      callback(null, true);
    } else {
      callback(new Error("Only PDF files are allowed"));
    }
  }
});

// All document routes
router.post("/upload", upload.single("document"), uploadDocument);    // frontend calls /upload
router.post("/uploads", upload.single("document"), uploadDocument);   // legacy alias
router.get("/", listDocuments);
router.get("/:sourceName/chunks", getDocumentChunks);
router.delete("/:sourceName", deleteDocument);

export default router;
