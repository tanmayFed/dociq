"use server";

import prisma from "@/lib/prisma";
import { zfd } from "zod-form-data";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

type ActionState = {
  success: boolean;
  message: string;
};

const signupSchema = zfd.formData({
  email: zfd.text(z.email({ message: "Invalid email address" })),
  password: zfd.text(z.string().min(8).max(30)),
  displayName: zfd.text(z.string().min(1).max(50)),
});

export async function signupAction(state: ActionState, formData: FormData) {
  const parsedData = signupSchema.safeParse(formData);

  if (!parsedData.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { email, password, displayName } = parsedData.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: displayName,
        email,
        password: hashedPassword,
      },
    });

    return redirect("/login");
  } catch (error) {
    return {
      success: false,
      message: "An internal error occurred. Try again later.",
    };
  }
}
