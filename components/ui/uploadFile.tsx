"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Flex,
  Text,
  Spinner,
  VStack,
  Center,
  Stack,
} from "@chakra-ui/react";
import { MdUpload, MdChatBubbleOutline } from "react-icons/md";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UserDocument {
  id: string;
  fileName: string;
  mimeType: string;
  uploadedAt: Date;
  filePath: string;
}

export default function UploadFile({
  userId,
  documents = [],
  onDeleteDocument,
}: {
  userId: string;
  documents?: UserDocument[];
  onDeleteDocument?: (
    documentId: string
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUploadSuccess, setFileUploadSuccess] = useState<Boolean | null>(
    false
  );
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const hasDocuments = documents && documents.length > 0;

  async function handleDelete(docId: string) {
    if (!onDeleteDocument) return;

    const confirmed = confirm("Are you sure you want to delete this document?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await onDeleteDocument(docId);
      if (result.success) {
        toast.success("Document deleted!", { position: "top-center" });
        window.location.reload();
      } else {
        toast.error(result.error || "Delete failed!", {
          position: "top-center",
        });
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Delete failed!", { position: "top-center" });
    } finally {
      setDeleting(false);
    }
  }

  async function handleUpload() {
    if (!file) return alert("Select a file first");
    setUploading(true);
    setFileUploadSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("type", file.type);
    formData.append("size", file.size.toString());

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFileUploadSuccess(true);
      } else {
        console.error("Upload failed with status:", res.status);
        setFileUploadSuccess(false);
      }
    } catch (err) {
      console.error("Error uploading the file: ", err);
      setFileUploadSuccess(false);
    }
  }

  useEffect(() => {
    console.log(fileUploadSuccess, uploading);
    if (uploading && fileUploadSuccess === false) {
      setUploading(false);
      toast.error("Upload failed!", { position: "top-center" });
    }
    if (uploading && fileUploadSuccess === true) {
      setUploading(false);
      toast.success("Upload success!", { position: "top-center" });
      setProcessing(true);
      setTimeout(() => {
        router.push("/chat");
      }, 1500);
    }
  }, [fileUploadSuccess, uploading, router]);
  return (
    <div className="p-4 border rounded-lg flex flex-col gap-3 max-w-md ">
      {!hasDocuments && (
        <Box
          height="100%"
          shadow="md"
          padding="4"
          border="border.emphasized"
          borderRadius="md"
          cursor="pointer"
          asChild
        >
          <Flex>
            <Button
              colorPalette="teal"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? file.name : " Click to Upload file"}
            </Button>
            <input
              hidden
              ref={fileInputRef}
              type="file"
              id="upload"
              accept="application/pdf"
              onChange={(e) => {
                return setFile(e.target.files?.[0] || null);
              }}
            />
            {file && (
              <CloseButton onClick={() => setFile(null)} variant="outline" />
            )}
          </Flex>
        </Box>
      )}

      {hasDocuments && documents && documents.length > 0 && (
        <Box>
          <Text fontWeight="semibold" mb="3">
            Selected Document:
          </Text>
          {documents.map((doc) => (
            <Flex
              key={doc.id}
              direction="column"
              justify="space-between"
              gap="3"
              mb="3"
              p="4"
              shadow="md"
            >
              <Flex
                key={doc.id}
                direction="row"
                justify="space-between"
                gap="3"
              >
                <Stack>
                  <Text fontWeight="medium">{doc.fileName}</Text>
                  <Text fontSize="sm" color="gray.600">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </Text>
                </Stack>

                <CloseButton
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting}
                  colorPalette="red"
                  variant="subtle"
                  size="sm"
                />
              </Flex>

              <Button
                colorPalette="teal"
                variant="solid"
                onClick={() => {
                  setNavigating(true);
                  router.push("/chat");
                }}
                loading={navigating}
              >
                <MdChatBubbleOutline /> Chat
              </Button>
            </Flex>
          ))}
        </Box>
      )}

      {!hasDocuments && (
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          colorPalette="teal"
          variant="solid"
        >
          <MdUpload />
          {uploading ? "Uploading..." : "Upload PDF"}
        </Button>
      )}

      {processing && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.5)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="9999"
        >
          <Center>
            <VStack gap="4">
              <Spinner size="xl" color="white" />
              <Text color="white" fontSize="lg" fontWeight="semibold">
                Processing your document...
              </Text>
            </VStack>
          </Center>
        </Box>
      )}
    </div>
  );
}
