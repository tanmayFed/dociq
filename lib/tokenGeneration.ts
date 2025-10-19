"use server";

import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { hash } from "@/utils/helper";

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export async function generateToken(payload: object) {
  const res = await jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
  return res;
}

export async function createLoggedInSession(payload: {
  sub: string;
  email: string;
  name: string;
}): Promise<{
  success: boolean;
  message?: string;
  data?: { accessToken: string; idToken: string; refreshToken: string };
}> {
  const accessToken = await generateToken(payload);
  const idToken = await generateToken(payload);
  const rawRefreshToken = crypto.randomUUID();
  const hashedRefreshToken = hash(rawRefreshToken);
  try {
    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
      },
    });
    return {
      success: true,
      data: { accessToken, idToken, refreshToken: rawRefreshToken },
    };
  } catch (err) {
    return { success: false, message: "Internal server error." };
  }
}
