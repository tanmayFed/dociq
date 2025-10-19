"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import path from "path";
import { cacheDelete, cacheGet, cacheSet } from "./cacheData";
import { hash } from "@/utils/helper";
import prisma from "@/lib/prisma";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

interface UserData {
  userId: string;
  email: string;
  name: string;
}

interface SessionData extends AuthTokens {
  user: UserData;
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_ID_KEY = "session_id";

const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents client-side JS access (CRUCIAL for security)
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: "lax" as "lax", // Good balance of security and usability
  maxAge: SESSION_TTL_SECONDS, // Cookie expires when the Redis session expires
  path: "/",
};

// Local typed subset for the mutable cookie store used in server context.
// We keep a small interface to avoid changing global Next.js types.
interface MutableCookies {
  set(name: string, value: string, opts?: Record<string, unknown>): void;
  get(name: string): { value: string } | undefined;
  delete(name: string): void;
}

/**
 * Creates a new session in Redis and stores the session ID in a secure cookie.
 * @param tokens The authentication tokens (accessToken, refreshToken, idToken).
 * @param user Basic user information to store in the session.
 */
export async function setSession(tokens: AuthTokens, user: UserData) {
  const cookieStore = cookies() as unknown as MutableCookies;
  const sessionId = crypto.randomUUID();

  const sessionData: SessionData = { ...tokens, user };
  const sessionString = JSON.stringify(sessionData);

  const sessionIdKey = await cacheSet(sessionId, sessionString);

  if (sessionIdKey) {
    cookieStore.set(SESSION_ID_KEY, sessionIdKey, COOKIE_OPTIONS);
  } else {
    console.warn("cacheSet did not return a session id; cookie not set.");
  }
}

/**
 * Retrieves the complete session data (tokens and user info) from Redis.
 * This can be called from any Server Component, Server Action, or Route Handler.
 * @returns An object containing the current tokens and user data, or null if session is invalid or expired.
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies() as unknown as MutableCookies;

  const sessionId = cookieStore.get(SESSION_ID_KEY)?.value;
  if (!sessionId) {
    return null;
  }

  const sessionString = await cacheGet(sessionId);

  if (!sessionString) {
    // Session ID exists, but the key expired in Redis
    // Clear the stale cookie for cleanup
    cookieStore.delete(SESSION_ID_KEY);
    return null;
  }

  try {
    const sessionData: SessionData = sessionString;
    return sessionData;
  } catch (e) {
    // Clear the cookie to force re-login if data is corrupted
    await destroySession();
    return null;
  }
}

/**
 * Deletes the session entry from Redis and removes the session ID cookie.
 */
export async function destroySession() {
  const cookieStore = cookies() as unknown as MutableCookies;
  const sessionId = cookieStore.get(SESSION_ID_KEY)?.value;
  if (!sessionId) return;
  const sessionData = await getSession();
  // Revoke refresh token in DB asynchronously so user isn't blocked on DB work.
  (async () => {
    try {
      const rawRefreshToken = sessionData?.refreshToken || "";
      const hashedRefreshToken = hash(rawRefreshToken);
      await prisma.refreshToken.delete({
        where: { tokenHash: hashedRefreshToken },
      });
    } catch (e) {
      console.error("Background error revoking refresh token in DB:", e);
    }
  })();

  await cacheDelete(sessionId);

  cookieStore.delete(SESSION_ID_KEY);
}
