export const evaluateAnswer = ({
  question,
  answer,
  context,
  expectedKeywords
}) => {

  const normalizedAnswer = answer.toLowerCase();

  // 1. Answer relevance proxy
  const answerHasKeywords = expectedKeywords.every(
    (keyword) =>
      normalizedAnswer.includes(keyword.toLowerCase())
  );

  // 2. Groundedness proxy
  const contextSupportsKeywords = expectedKeywords.every(
    (keyword) =>
      context.toLowerCase().includes(keyword.toLowerCase())
  );

  // 3. Context relevance proxy
  const contextHasKeywords = expectedKeywords.some(
    (keyword) =>
      context.toLowerCase().includes(keyword.toLowerCase())
  );

  return {
    contextRelevance: contextHasKeywords,

    groundedness: contextSupportsKeywords,

    answerRelevance: answerHasKeywords
  };
};