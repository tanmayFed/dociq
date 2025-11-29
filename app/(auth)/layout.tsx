import { Box, Flex, Heading, Image, Button } from "@chakra-ui/react";
import Link from "next/link";
import { logoutAction } from "./_services/actions";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" bg="gray.50">
      <Flex
        as="header"
        align="center"
        justify={{ base: "center", md: "flex-start" }}
        px={{ base: 4, md: 8 }}
        py={6}
        bg="white"
        borderBottom="1px"
        borderColor="gray.200"
        shadow="sm"
      >
        <Link href="/dashboard">
          <Flex align="center" gap={3} cursor="pointer">
            <Image
              src="/logo.png"
              alt="DocIQ Logo"
              boxSize="40px"
              objectFit="contain"
            />
            <Heading as="h1" size="lg" color="teal.600" fontWeight="bold">
              DocIQ
            </Heading>
          </Flex>
        </Link>

        <Flex ms="auto">
          <form action={logoutAction}>
            <Button type="submit">Log Out</Button>
          </form>
        </Flex>
      </Flex>

      <Box as="main">{children}</Box>
    </Box>
  );
}
