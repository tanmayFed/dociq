import { getEmbeddings } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { Prisma } from "../../generated/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { NextResponse } from "next/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

type DocumentChunk = {
  id: string;
  content: string;
  distance: number;
};

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  // 1. Extract the query (same logic)
  const lastUserMessage = messages[messages.length - 1];
  const textPart = lastUserMessage.parts.find(
    (part: any) => part.type === "text"
  );
  const query = (textPart as any)?.text || null;

  const queryEmbedding = await getEmbeddings(query, "RETRIEVAL_QUERY");
  const K = 5;
  const vectorString = `[${queryEmbedding.join(",")}]`;

  const retrievalResult = await prisma.$queryRaw<DocumentChunk[]>(Prisma.sql`
        SELECT id, content, ${Prisma.raw(
          "embedding"
        )} <-> ${vectorString}::vector AS distance
        FROM ${Prisma.raw("document_chunks")}
        ORDER BY distance ASC
        LIMIT ${K};
      `);

  if (!retrievalResult || retrievalResult.length === 0) {
    return new NextResponse("No relevant document context found.", {
      status: 404,
    });
  }

  const context = retrievalResult?.map((row) => row.content).join("\n---\n");

  const systemInstruction = `You are a professional research assistant. Use the following CONTEXT to provide a clear, concise, and factual answer to the user's question. 
        If the context does not contain the necessary information, state clearly that you cannot answer based on the provided documents.

        **CONTEXT:**
        ${context}
        `;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    // Handle error if key is still missing
    return new NextResponse("API Key configuration error.", { status: 500 });
  }
  const googleWithKey = createGoogleGenerativeAI({ apiKey });
  const result = streamText({
    model: googleWithKey("gemini-2.5-flash"),
    system: systemInstruction,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
