import prisma from "@/lib/prisma";
import { Link, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";

export default async function Home() {
  return (
    <Stack alignItems="center" justifyContent="center">
      <Stack
        gap={8}
        alignItems="center"
        justifyContent="center"
        width={{ base: "80%", md: "80%", lg: "70%" }}
      >
        <Image
          src="/comingSoon.jpg"
          alt="Coming soon"
          width={800}
          height={450}
          className="w-full h-auto rounded-lg"
          priority
        />
        <Text
          fontWeight={{ base: "medium", md: "semibold" }}
          fontSize={{ base: "sm", md: "2xl" }}
        >
          Meanwhile, you are welcome to{" "}
          <Link variant="underline" href="/register" colorPalette="teal">
            register
          </Link>{" "}
          with us and be the first to know when we launch!
        </Text>
      </Stack>
    </Stack>
  );
}
