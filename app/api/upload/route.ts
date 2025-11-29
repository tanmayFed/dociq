import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import PDFParser from "pdf2json";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const userId = formData.get("userId") as string | null;

  if (!file || !userId) {
    return NextResponse.json(
      { error: "Missing file or userId" },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF." }, { status: 415 });
  }

  const filePath = `user-${userId}/${randomUUID()}-${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  let extractedText = "";
  const pdfParser = new (PDFParser as any)(null, 1);

  pdfParser.on("pdfParser_dataError", (errData: any) =>
    console.log(errData.parserError)
  );

  pdfParser.on("pdfParser_dataReady", () => {
    extractedText = (pdfParser as any).getRawTextContent();
  });

  try {
    await new Promise((resolve, reject) => {
      pdfParser.parseBuffer(fileBuffer);
      pdfParser.on("pdfParser_dataReady", resolve);
      pdfParser.on("pdfParser_dataError", reject);
    });
  } catch (err) {
    console.log("Error in parsing PDF", err);
  }

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, fileBuffer, {
      contentType: file.type,
    });

  if (error) {
    console.error("Supabase Error: ", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  try {
    const newAsset = await prisma.asset.create({
      data: {
        userId: userId,
        fileName: file.name,
        mimeType: file.type,
        filePath: filePath,
        textContent: extractedText,
      },
    });
    const url =
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL
        : "http://localhost:3000";
    // Chunking text
    fetch(`${url}/api/process-asset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId: newAsset.id }),
    }).catch((err) => {
      console.error("Failed to trigger background process:", err);
    });

    return NextResponse.json({
      success: true,
      assetId: newAsset.id,
      path: data?.path,
    });
  } catch (err) {
    await supabase.storage.from("documents").remove([filePath]);
    return NextResponse.json(
      { success: false, error: "Database save failed. File was removed." },
      { status: 500 }
    );
  }
}
