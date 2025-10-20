"use client";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Button,
  Card,
  Field,
  Flex,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useActionState, useEffect, startTransition } from "react";
import { loginAction } from "../_services/login.server";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof loginSchema>;

type ActionState = {
  success: boolean;
  message: string;
};

const LoginPage = () => {
  const searchParams = useSearchParams();
  const emailRedirect = searchParams.get("email");
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    loginAction,
    {
      success: false,
      message: "",
    }
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: emailRedirect || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (state?.message && state?.success === false) {
      toast.error(state.message, { position: "top-center" });
    }
  }, [state]);

  return (
    <Flex justifyContent="center" minH="100vh" mt={8}>
      <Stack
        gap="32px"
        align="center"
        direction="column"
        width={{ base: "90%", md: "500px" }}
      >
        <Card.Root variant="elevated" width="100%">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card.Header>
              <Card.Title>Sign in</Card.Title>
              <Card.Description>
                Enter your credentials to access your account
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <Stack gap="20px">
                <Field.Root required invalid={!!errors.email}>
                  <Field.Label>
                    Email{" "}
                    <Field.RequiredIndicator
                      css={{ height: "20px", width: "20px", fontSize: "32px" }}
                    />
                  </Field.Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Enter your email"
                    variant="outline"
                  />
                  {errors.email && (
                    <Field.ErrorText>{errors.email.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root required invalid={!!errors.password}>
                  <Field.Label>
                    Password{" "}
                    <Field.RequiredIndicator
                      css={{ height: "20px", width: "20px", fontSize: "32px" }}
                    />
                  </Field.Label>
                  <PasswordInput
                    {...register("password")}
                    placeholder="Enter your password"
                    variant="outline"
                  />
                  {errors.password && (
                    <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </Stack>
            </Card.Body>
            <Card.Footer flexDirection="column" gap="16px">
              <Button
                type="submit"
                disabled={!isValid || isPending}
                loading={isPending}
                colorPalette="teal"
                variant="solid"
                width="100%"
              >
                Sign In
              </Button>

              <Text textAlign="center" fontSize="sm" color="gray.600">
                Don&apos;t have an account?{" "}
                <Link href="/register">
                  <Text
                    as="span"
                    color="teal.500"
                    fontWeight="medium"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Sign up
                  </Text>
                </Link>
              </Text>
            </Card.Footer>
          </form>
        </Card.Root>
      </Stack>
    </Flex>
  );
};

export default LoginPage;
