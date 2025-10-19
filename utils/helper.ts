import { Prisma } from "../app/generated/prisma";
import * as crypto from "crypto";

/*
This function checks for the fulfilment of following password requirement
Password:
1. Must be between 8-30 characters in length
2. Must contain at least two of the following:
    2.1. Uppercase letters
    2.2. Number between 0-9
    2.3, Special characters
*/

export const isPasswordValid = (password: string) => {
  if (password.length < 8 || password.length > 30) return false;

  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}'|<>]/.test(password);

  let criteriaMet = 0;
  if (hasUpperCase) criteriaMet++;
  if (hasNumber) criteriaMet++;
  if (hasSpecialChar) criteriaMet++;

  return criteriaMet >= 2;
};

export const hash = (inputString: string) => {
  return crypto.createHash("sha256").update(inputString).digest("hex");
};

export const handlePrismaError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    // Database connection errors
    return {
      error: "Database connection failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
      status: 503,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Known Prisma errors
    return {
      error: "Database operation failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please try again later",
      status: 400,
    };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    // Validation errors
    return {
      error: "Invalid request data",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Please check your input",
      status: 400,
    };
  }

  // Unknown errors
  return {
    error: "Something went wrong",
    details:
      process.env.NODE_ENV === "development"
        ? String(error)
        : "Please try again later",
    status: 500,
  };
};

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If it's not a connection error, don't retry
      if (!(error instanceof Prisma.PrismaClientInitializationError)) {
        throw error;
      }

      // Wait with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, baseDelay * Math.pow(2, i))
      );
    }
  }

  throw lastError;
};
