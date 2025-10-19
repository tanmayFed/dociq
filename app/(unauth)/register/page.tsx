"use client";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Button,
  Card,
  Field,
  Flex,
  Heading,
  Input,
  List,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isPasswordValid } from "@/utils/helper";
import Link from "next/link";
import { signupAction } from "../_services/signup";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";

const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Display name is required")
      .max(50, "Display name must be less than 50 characters"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .trim()
      .min(1, "Password is required")
      .refine(isPasswordValid, {
        message: "Password does not meet the required criteria",
      }),
    confirmPassword: z.string().trim().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [state, formAction, isPending] = useActionState(signupAction, {
    success: false,
    message: "",
  });
  const {
    register,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (state.message && state.success === false) {
      toast.error(state.message, { position: "top-center" });
    }
  }, [state]);

  return (
    <Flex minH="100vh" justifyContent="center" p={4}>
      <Stack gap="48px" direction="column" width={{ base: "80%", lg: "50%" }}>
        <Heading size="3xl">Chat with your notes</Heading>
        <Stack alignItems="center" justifyContent="center" direction="column">
          <Card.Root variant={"elevated"} width="100%" p="4">
            <form action={formAction}>
              <Card.Header>
                <Card.Title>Register with us</Card.Title>
                <Card.Description>
                  Fill in the form below to create an account
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <Stack gap="24px" align="center">
                  <Flex
                    gap="24px"
                    w="full"
                    direction={{ base: "column", md: "row" }}
                  >
                    <Field.Root required invalid={!!errors.displayName}>
                      <Field.Label>
                        Enter Name{" "}
                        <Field.RequiredIndicator
                          css={{
                            height: "20px",
                            width: "20px",
                            fontSize: "32px",
                          }}
                        />
                      </Field.Label>
                      <Input
                        {...register("displayName")}
                        placeholder="Enter your name"
                        variant="outline"
                      />
                      {errors.displayName && (
                        <Field.ErrorText>
                          {errors.displayName.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                    <Field.Root required invalid={!!errors.email}>
                      <Field.Label>
                        Email{" "}
                        <Field.RequiredIndicator
                          css={{
                            height: "20px",
                            width: "20px",
                            fontSize: "32px",
                          }}
                        />
                      </Field.Label>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="Enter your email"
                        variant="outline"
                      />
                      {errors.email && (
                        <Field.ErrorText>
                          {errors.email.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  </Flex>
                  <Flex
                    gap="24px"
                    w="full"
                    direction={{ base: "column", md: "row" }}
                  >
                    <Field.Root required invalid={!!errors.password}>
                      <Flex gap="4px" align="center">
                        <Field.Label>
                          Password{" "}
                          <Field.RequiredIndicator
                            css={{
                              height: "20px",
                              width: "20px",
                              fontSize: "32px",
                            }}
                          />
                        </Field.Label>
                      </Flex>
                      <PasswordInput
                        {...register("password")}
                        placeholder="Enter your password"
                        variant="outline"
                      />
                      {errors.password && (
                        <Field.ErrorText>
                          {errors.password.message}
                        </Field.ErrorText>
                      )}
                      <Field.HelperText>
                        <List.Root pl={4}>
                          <List.Item>
                            Must be between 8-30 characters in length
                          </List.Item>
                          <List.Item>
                            Must contain at least two of the following:
                            <List.Root ps="5">
                              <List.Item>Uppercase letter</List.Item>
                              <List.Item>Number between 0-9</List.Item>
                              <List.Item>Special characters</List.Item>
                            </List.Root>
                          </List.Item>
                        </List.Root>
                      </Field.HelperText>
                    </Field.Root>
                    <Field.Root required invalid={!!errors.confirmPassword}>
                      <Field.Label>
                        Confirm Password{" "}
                        <Field.RequiredIndicator
                          css={{
                            height: "20px",
                            width: "20px",
                            fontSize: "32px",
                          }}
                        />
                      </Field.Label>
                      <PasswordInput
                        {...register("confirmPassword")}
                        placeholder="Re-enter your password"
                        variant="outline"
                      />
                      {errors.confirmPassword && (
                        <Field.ErrorText>
                          {errors.confirmPassword.message}
                        </Field.ErrorText>
                      )}
                    </Field.Root>
                  </Flex>
                </Stack>
              </Card.Body>
              <Card.Footer justifyContent="flex-end">
                <Button
                  disabled={isPending}
                  colorPalette="teal"
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || isPending}
                  loading={isPending}
                  colorPalette="teal"
                  variant="solid"
                >
                  Register
                </Button>
              </Card.Footer>
            </form>
            <Text textAlign="center" fontSize="sm" color="gray.600">
              Already have an account?{" "}
              <Link href="/login">
                <Text
                  as="span"
                  color="teal.500"
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                >
                  Login
                </Text>
              </Link>
            </Text>
          </Card.Root>
        </Stack>
      </Stack>
    </Flex>
  );
};

export default Signup;
