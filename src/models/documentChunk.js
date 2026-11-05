import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    embedding: {
      type: [Number],
      required: true
    },
    metadata: {
      source: {
        type: String,
        required: true
      },
      page: {
        type: Number
      }
    }
  },
  { timestamps: true }
);

const DocumentChunk =
  mongoose.models.DocumentChunk ||
  mongoose.model("DocumentChunk", documentChunkSchema);

export default DocumentChunk;
