"use client";

import { useChat } from "@ai-sdk/react";
import { Box, Button, Spinner, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { MdArrowBack } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Page() {
  const { messages, sendMessage, status } = useChat({});
  const isLoading = status !== "ready" && status !== "error";
  const [input, setInput] = useState("");
  const router = useRouter();

  return (
    <>
      <Box marginBlock={2}>
        <Button variant={"ghost"} onClick={() => router.push("/dashboard")}>
          <MdArrowBack /> Dashboard
        </Button>
      </Box>
      <Box
        border="1px solid #ccc"
        borderBottom="none"
        borderRadius="lg"
        p={8}
        h="500px"
        overflowY="auto"
      >
        {messages.length === 0 && (
          <Text color="gray.500">Start chatting with the AI...</Text>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            display="flex"
            justifyContent={message.role === "user" ? "flex-end" : "flex-start"}
            mb={2}
          >
            <Box
              width={"80%"}
              bg={message.role === "user" ? "teal.solid" : "pink.300"}
              borderRadius="md"
              p={3}
            >
              <Text fontWeight="bold" mb={1}>
                {message.role === "user" ? "You" : "AI"}
              </Text>
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <Text key={index}>{part.text}</Text>
                ) : null
              )}
            </Box>
          </Box>
        ))}

        {isLoading && (
          <Box
            bg="green.50"
            borderRadius="md"
            p={3}
            mb={2}
            display="inline-flex"
            alignItems="center"
            gap={2}
          >
            <Spinner size="sm" /> <Text>AI is typing...</Text>
          </Box>
        )}
      </Box>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
          }
        }}
      >
        <Stack
          gap={"16px"}
          padding={"4"}
          border="1px solid #ccc"
          borderRadius="lg"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== "ready"}
            placeholder="Say something..."
            className="rounded-sm focus:outline-none w-full p-6"
          />
          <Stack>
            <Button type="submit" disabled={status !== "ready"}>
              Submit
            </Button>
          </Stack>
        </Stack>
      </form>
    </>
  );
}
