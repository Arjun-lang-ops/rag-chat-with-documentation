import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import fs from "fs";
import DocumentChunk from "../models/documentChunk.js";
import { cleanText } from "../utils/textCleaner.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
  outputDimensionality: 768
});

export const ingestPDF = async (filePath, sourceName) => {
  let documents = [];

  try {
    const loader = new PDFLoader(filePath, { splitPages: true });
    documents = await loader.load();
  } catch (err) {
    throw new Error(`Failed to parse PDF: ${err.message}`);
  } finally {
    // Always clean up the temp file
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }

  if (!documents || documents.length === 0) {
    throw new Error("No readable text found in the PDF. The file may be scanned or image-only.");
  }

  // Clean and filter empty pages
  const cleanedDocuments = documents
    .map((doc, i) => ({
      pageContent: cleanText(doc.pageContent || ""),
      metadata: {
        source: sourceName,
        page: doc.metadata?.loc?.pageNumber || i + 1
      }
    }))
    .filter((doc) => doc.pageContent.length > 10);

  if (cleanedDocuments.length === 0) {
    throw new Error("PDF contained no extractable text after cleaning.");
  }

  // Split into overlapping chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  const chunks = await splitter.splitDocuments(cleanedDocuments);

  // Embed all chunk texts
  const texts = chunks.map((chunk) => chunk.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  // Build MongoDB records
  const records = chunks.map((chunk, i) => ({
    text: chunk.pageContent,
    embedding: vectors[i],
    metadata: {
      source: sourceName,
      page: chunk.metadata.page || 1
    }
  }));

  // Remove any existing chunks for this source (re-upload replaces old data)
  await DocumentChunk.deleteMany({ "metadata.source": sourceName });
  await DocumentChunk.insertMany(records);

  return {
    sourceName,
    totalPages: documents.length,
    totalChunks: chunks.length
  };
};
