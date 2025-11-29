import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 3072;
type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * Generates a vector embedding for a given text, optimized for its role in RAG.
 * @param text The text to embed (document chunk or user query).
 * @param type The task type: RETRIEVAL_DOCUMENT for chunks, RETRIEVAL_QUERY for user query.
 * @returns A promise that resolves to the embedding vector (array of numbers).
 */
export async function getEmbeddings(
  text: string,
  type: EmbeddingTaskType
): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      taskType: type,
      outputDimensionality: EMBEDDING_DIMENSION,
    },
  });

  const responseData = response.embeddings!;
  const embeddingVector = responseData[0].values!;

  return embeddingVector;
}
