"use server";

import prisma from "@/lib/prisma";

export interface UserDocument {
  id: string;
  fileName: string;
  mimeType: string;
  uploadedAt: Date;
  filePath: string;
}

export async function getUserDocuments(
  userId: string
): Promise<UserDocument[]> {
  try {
    const assets = await prisma.asset.findMany({
      where: { userId },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        uploadedAt: true,
        filePath: true,
      },
      orderBy: { uploadedAt: "desc" },
    });
    return assets;
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
}
