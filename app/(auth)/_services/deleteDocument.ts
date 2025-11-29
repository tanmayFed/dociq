"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUserDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete related DocumentChunks first (due to foreign key constraint)
    await prisma.documentChunk.deleteMany({
      where: { assetId: documentId },
    });

    // Delete related AssetText records
    await prisma.assetText.deleteMany({
      where: { assetId: documentId },
    });

    // Delete related AssetEmbedding records
    await prisma.assetEmbedding.deleteMany({
      where: { assetId: documentId },
    });

    // Finally, delete the Asset itself
    await prisma.asset.delete({
      where: { id: documentId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: "Failed to delete document" };
  }
}
