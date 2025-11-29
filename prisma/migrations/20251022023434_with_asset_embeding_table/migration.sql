-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_url" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "text_content" TEXT,
    "embedding" TEXT,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_texts" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_embeddings" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "chunkText" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "assets_file_path_key" ON "assets"("file_path");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_texts" ADD CONSTRAINT "asset_texts_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_embeddings" ADD CONSTRAINT "asset_embeddings_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    -- Specify the exact dimension from your embedding model (e.g., 1536 for OpenAI)
    "embedding" vector(3072), 
    "chunk_index" INTEGER NOT NULL,
    
    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- 3. Add Foreign Key
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "document_chunks" ALTER COLUMN "embedding" TYPE vector(3072) USING "embedding"::vector(3072);

-- 4. Create the Index for fast search (Crucial for performance)
-- Choose L2 (Euclidean), Inner Product (ip), or Cosine (cosine) operators
-- This example uses Cosine similarity with IVFFlat, which is a common choice.
CREATE INDEX document_chunks_embedding_idx ON "document_chunks" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);