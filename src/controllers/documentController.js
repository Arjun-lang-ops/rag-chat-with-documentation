import { ingestPDF } from "../services/ingestionService.js";
import DocumentChunk from "../models/documentChunk.js";
import fs from "fs";

// POST /api/documents/upload  or  /api/documents/uploads
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "PDF file is required. Send it as form-data with key 'document'."
      });
    }

    const result = await ingestPDF(req.file.path, req.file.originalname);

    return res.status(201).json({
      success: true,
      message: `Document '${req.file.originalname}' ingested successfully`,
      result
    });
  } catch (error) {
    // Clean up temp file if ingestion failed
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    next(error);
  }
};

// GET /api/documents  — list all indexed documents with chunk counts
export const listDocuments = async (req, res, next) => {
  try {
    const summary = await DocumentChunk.aggregate([
      {
        $group: {
          _id: "$metadata.source",
          chunkCount: { $sum: 1 },
          totalPages: { $max: "$metadata.page" },
          lastUpdated: { $max: "$createdAt" }
        }
      },
      {
        $project: {
          source: "$_id",
          _id: 0,
          chunkCount: 1,
          totalPages: 1,
          lastUpdated: 1
        }
      },
      { $sort: { lastUpdated: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      totalDocuments: summary.length,
      documents: summary
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/documents/:sourceName/chunks
export const getDocumentChunks = async (req, res, next) => {
  try {
    const sourceName = decodeURIComponent(req.params.sourceName);
    const chunks = await DocumentChunk.find(
      { "metadata.source": sourceName },
      { text: 1, metadata: 1, createdAt: 1 }
    )
      .sort({ "metadata.page": 1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      source: sourceName,
      totalReturned: chunks.length,
      chunks
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/documents/:sourceName
export const deleteDocument = async (req, res, next) => {
  try {
    const sourceName = decodeURIComponent(req.params.sourceName);
    const result = await DocumentChunk.deleteMany({ "metadata.source": sourceName });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: `No document found with source name '${sourceName}'`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Deleted '${sourceName}'`,
      deletedChunks: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
