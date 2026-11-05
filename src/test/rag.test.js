import { evaluateAnswer } from "../src/services/evaluationService.js";

describe("RAG Evaluation", () => {

  test("should evaluate a grounded and relevant answer", () => {

    const result = evaluateAnswer({
      question: "How many annual leave days do employees get?",

      answer: "Employees are entitled to 20 days of annual leave.",

      context: "Employees are entitled to 20 days of annual leave.",

      expectedKeywords: [
        "20 days",
        "annual leave"
      ]
    });

    expect(result.contextRelevance).toBe(true);

    expect(result.groundedness).toBe(true);

    expect(result.answerRelevance).toBe(true);
  });

}); 