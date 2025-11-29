import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";
import { chunkText } from "@/utils/textProcessor";
import { getEmbeddings } from "@/lib/gemini";

export async function POST(req: Request) {
  const { assetId } = await req.json();
  if (!assetId) {
    return NextResponse.json({ error: "Missing assetId" }, { status: 400 });
  }

  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { textContent: true },
    });

    if (!asset?.textContent) {
      return NextResponse.json(
        { error: "Asset text not found." },
        { status: 404 }
      );
    }

    const text = asset.textContent;

    // --- STEP 1: CHUNKING ---
    const textChunks = await chunkText(text);

    // --- STEP 2: EMBEDDING AND DATABASE SAVE (NEXT LOGIC) ---
    const chunkPromises = textChunks.map(async (chunkContent, index) => {
      const embeddingVector = await getEmbeddings(
        chunkContent,
        "RETRIEVAL_DOCUMENT"
      );
      const newId = uuidv4();
      const vectorString = embeddingVector.join(",");

      const cleanContent = chunkContent
        .replace(/\\/g, "\\\\") // Escape backslashes
        .replace(/'/g, "''") // Escape single quotes
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ""); // Remove ALL control characters

      // 2. Prepare quoted SQL values (for $queryRawUnsafe)
      const idSql = `'${newId}'`;
      const assetIdSql = `'${assetId}'`;
      const contentSql = `'${cleanContent}'`;
      const chunkIndexSql = index;
      const vectorStringSql = `'[${vectorString}]'`;

      // 3. Construct the full SQL string, including the explicit "id"
      const insertQuery = `
  INSERT INTO "document_chunks" ("id", "asset_id", "content", "embedding", "chunk_index")
  VALUES (
    ${idSql}, 
    ${assetIdSql}, 
    ${contentSql}, 
    ${vectorStringSql}::vector,
    ${chunkIndexSql}
  )
 RETURNING 
    "id", 
    "asset_id", 
    "content", 
    "chunk_index",
    "embedding"::TEXT AS embedding;
`;

      try {
        await prisma.$queryRawUnsafe(insertQuery);
      } catch (err) {
        // If it STILL fails, the issue is outside of your application code (DB trigger/setting).
        console.error("Error in insert query: ", err);
      }

      return { index, status: "Success" }; // Placeholder return
    });

    await Promise.all(chunkPromises);

    return NextResponse.json({
      success: true,
      message: "Processing complete.",
    });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      { error: "Failed to process asset." },
      { status: 500 }
    );
  }
}
