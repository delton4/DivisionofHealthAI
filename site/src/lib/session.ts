import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.SESSION_SECRET;
if (!SECRET_KEY && process.env.NODE_ENV !== "development" && !process.env.GITHUB_ACTIONS) {
  throw new Error("SESSION_SECRET must be set");
}
const key = new TextEncoder().encode(SECRET_KEY || "dev-secret-change-me");
const COOKIE_NAME = "session";
const ADMIN_HINT_COOKIE = "admin_logged_in";

interface SessionPayload {
  userId: number;
  email: string;
  expiresAt: string;
}

async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: number, email: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encrypt({
    userId,
    email,
    expiresAt: expiresAt.toISOString(),
  });

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });

  // Non-httpOnly hint cookie for client-side admin detection
  cookieStore.set(ADMIN_HINT_COOKIE, "1", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
}

const ROTATION_THRESHOLD_MS = 24 * 60 * 60 * 1000; // Rotate after 24h of active use

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await decrypt(token);
  if (!payload) return null;

  const expiresAt = new Date(payload.expiresAt);
  if (expiresAt < new Date()) return null;

  // Rotate token if past threshold — limits window for compromised tokens
  const maxLifetime = 7 * 24 * 60 * 60 * 1000;
  const elapsed = maxLifetime - (expiresAt.getTime() - Date.now());
  if (elapsed > ROTATION_THRESHOLD_MS) {
    await createSession(payload.userId, payload.email);
  }

  return payload;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(ADMIN_HINT_COOKIE);
}
