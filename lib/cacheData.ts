"use server";
import redisClient from "@/lib/valkey";
import { randomUUID } from "node:crypto";
import "server-only";

const SESSION_EXPIRE_IN = 60 * 60 * 24 * 7; // 7 days in seconds

const getSessionKey = (sessionId: string) => `SESSION_${sessionId}`;

export const cacheSet = async (userId: string, userData: string) => {
  if (!userId) return;

  const sessionId = randomUUID();

  await redisClient.set(
    getSessionKey(sessionId),
    userData,
    "EX",
    SESSION_EXPIRE_IN
  );

  return sessionId;
};

export const cacheGet = async (sessionId: string) => {
  if (!sessionId) return undefined;

  const data = await redisClient.get(getSessionKey(sessionId));
  if (!data) return undefined;

  const session = JSON.parse(data);

  return session;
};

export const cacheDelete = async (sessionId: string) => {
  if (!sessionId) return;
  await redisClient.del(getSessionKey(sessionId));
};
