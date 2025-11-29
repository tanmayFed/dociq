"use client";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Flex, Skeleton, Stack } from "@chakra-ui/react";

const LoginPage = () => {
  return (
    <Suspense
      fallback={
        <Flex justifyContent="center" minH="100vh" mt={8}>
          <Stack gap="32px" align="center" direction="column">
            <Skeleton height="200px" />
          </Stack>
        </Flex>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
