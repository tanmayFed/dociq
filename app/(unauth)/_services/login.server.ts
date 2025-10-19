"use server";

import prisma from "@/lib/prisma";
import { zfd } from "zod-form-data";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { createLoggedInSession, generateToken } from "@/lib/tokenGeneration";
import { setSession } from "@/lib/session";

type ActionState = {
  success: boolean;
  message: string;
};

const loginSchema = zfd.formData({
  email: zfd.text(z.email({ message: "Invalid email address" })),
  password: zfd.text(z.string().min(8).max(30)),
});

export async function loginAction(
  state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsedData = loginSchema.safeParse(formData);

    if (!parsedData.success) {
      return {
        success: false,
        message: "Invalid form format",
      };
    }

    const { email, password } = parsedData.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    const jwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const token = await createLoggedInSession(jwtPayload);
    if (token.success === false) {
      throw new Error("Failed to create logged-in session");
    }
    await setSession(token.data!, {
      userId: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    };
  }

  return redirect("/dashboard");
}
