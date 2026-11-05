import { z } from "zod";
import { retrieveDocuments } from "../services/retrievalService.js";
import { generateAnswer } from "../services/generationService.js";

const questionSchema = z.object({
  question: z.string().min(2, "Question must be at least 2 characters").max(2000),
  source: z.string().optional(),
  threshold: z.number().min(0).max(1).optional(),
  limit: z.number().int().min(1).max(20).optional()
});

export const askQuestion = async (req, res, next) => {
  try {
    // 1. Validate request body
    const validation = questionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid question payload",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const { question, source, threshold, limit } = validation.data;

    // 2. Retrieve relevant chunks
    const documents = await retrieveDocuments(question, { source, threshold, limit });

    // 3. Generate grounded answer
    const result = await generateAnswer(question, documents);

    // 4. Return response — always include success: true so frontend can check it
    return res.status(200).json({
      success: true,
      question,
      answer: result.answer,
      sources: result.sources,
      retrievedCount: documents.length,
      topScore: documents.length > 0 ? documents[0].score : null
    });

  } catch (error) {
    next(error);
  }
};
