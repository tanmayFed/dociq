import { Center, Link, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";

export default function NotFound() {
  return (
    <main>
      <Stack backgroundColor={"orange.200"} padding={4} height={"100vh"}>
        <Center>
          <Stack
            gap={{ base: "16px", md: "48px" }}
            alignItems="center"
            width={{ base: "80%", md: "500px" }}
          >
            <Text fontWeight="bold" fontSize={{ base: "3xl", md: "5xl" }}>
              Page Not Found
            </Text>
            <Image
              src={"/not-found.png"}
              alt="Page not found picture"
              width={500}
              height={500}
              priority
            />
            <Text fontSize={{ base: "md", md: "md" }}>
              The page you are looking for might have been removed had its name
              changed or is unavailable
            </Text>
            <Text>
              Let's get you back{" "}
              <Link variant="underline" href="/dashboard" colorPalette="teal">
                Home
              </Link>
            </Text>
          </Stack>
        </Center>
      </Stack>
    </main>
  );
}
