import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkText(text: string): Promise<string[]> {
  const chunkSize = 1500;
  const chunkOverlap = 200;

  // Define separators to maintain semantic structure:
  // 1. Double newline (paragraph)
  // 2. Single newline (line break)
  // 3. Space
  // 4. Fallback to single character
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: chunkSize,
    chunkOverlap: chunkOverlap,
    separators: ["\n\n", "\n", " ", ""],
  });

  try {
    const documents = await splitter.createDocuments([text]);

    return documents.map((doc) => doc.pageContent);
  } catch (error) {
    console.error("Error during text chunking:", error);
    return [text];
  }
}
