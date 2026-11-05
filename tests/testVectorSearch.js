import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import DocumentChunk from "../src/models/documentChunk.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const emb768 = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
    outputDimensionality: 768
  });

  const queryVector = await emb768.embedQuery("Project Planning Timeline");
  console.log("Query vector length:", queryVector.length);

  try {
    const res = await DocumentChunk.aggregate([
      {
        $vectorSearch: {
          index: process.env.VECTOR_INDEX_NAME || "vector_index",
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit: 5
        }
      },
      {
        $project: {
          text: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ]);
    console.log("VectorSearch result count:", res.length);
    res.forEach((r, i) => console.log(`[${i}] score: ${r.score}, preview: ${r.text?.slice(0, 80)}`));
  } catch (err) {
    console.error("VectorSearch error:", err.message);
  }

  await mongoose.disconnect();
}

main().catch(console.error);

