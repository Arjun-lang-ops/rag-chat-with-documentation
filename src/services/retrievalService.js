import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import DocumentChunk from "../models/documentChunk.js";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: process.env.EMBEDDING_MODEL || "gemini-embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
  outputDimensionality: 768
});

/**
 * Cosine similarity between two vectors (fallback for when Atlas $vectorSearch is unavailable)
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export const retrieveDocuments = async (query, options = {}) => {
  const limit = options.limit || 5;
  const threshold = typeof options.threshold === "number" ? options.threshold : 0.65;
  const sourceFilter = options.source;

  // 1. Embed the query
  const queryVector = await embeddings.embedQuery(query);

  let results = [];

  // 2. Try MongoDB Atlas $vectorSearch first
  try {
    const matchFilter = sourceFilter
      ? { "metadata.source": { $eq: sourceFilter } }
      : {};

    const pipeline = [
      {
        $vectorSearch: {
          index: process.env.VECTOR_INDEX_NAME || "vector_index",
          path: "embedding",
          queryVector,
          numCandidates: Math.max(limit * 20, 100),
          limit: limit * 2,
          ...(sourceFilter ? { filter: matchFilter } : {})
        }
      },
      {
        $project: {
          text: 1,
          metadata: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    results = await DocumentChunk.aggregate(pipeline);
  } catch (vectorSearchError) {
    // Atlas $vectorSearch not available — fall back to in-memory cosine similarity
    console.warn("$vectorSearch unavailable, using cosine similarity fallback:", vectorSearchError.message);

    const filter = sourceFilter ? { "metadata.source": sourceFilter } : {};
    const allChunks = await DocumentChunk.find(filter, { text: 1, metadata: 1, embedding: 1 }).lean();

    results = allChunks
      .map((chunk) => ({
        _id: chunk._id,
        text: chunk.text,
        metadata: chunk.metadata,
        score: cosineSimilarity(queryVector, chunk.embedding)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit * 2);
  }

  // 3. Apply relevance threshold, then cap at limit
  let relevant = results.filter((r) => r.score >= threshold).slice(0, limit);

  // If threshold too strict and nothing matched, return top result if score > 0.3
  if (relevant.length === 0 && results.length > 0 && results[0].score >= 0.3) {
    relevant = [results[0]];
  }

  return relevant;
};
