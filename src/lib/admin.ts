import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { notFound, redirect } from "next/navigation";
import { getAuthUser, getCurrentProfile } from "@/lib/current-user";

export const ADMIN_COOKIE_NAME = "yv_admin";
const UNLOCK_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Allowlisted admin emails (server-only env, never shipped to the client). */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function passcode(): string {
  return process.env.ADMIN_PASSCODE ?? "";
}
export function passcodeConfigured(): boolean {
  return passcode().length > 0;
}

export type AdminContext = { userId: string; email: string };

/** Resolve whether the current user is an admin (DB flag OR email allowlist). */
export async function getAdminContext(): Promise<AdminContext | null> {
  const user = await getAuthUser();
  if (!user) return null;
  const email = (user.email ?? "").toLowerCase();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.is_admin === true || adminEmails().includes(email);
  return isAdmin ? { userId: user.id, email } : null;
}

/** Gate an admin page. Non-admins get a 404 so the route stays invisible. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) notFound();
  return ctx;
}

function sign(userId: string, exp: number): string {
  return createHmac("sha256", passcode())
    .update(`${userId}.${exp}`)
    .digest("hex");
}

export function makeUnlockToken(userId: string): string {
  const exp = Date.now() + UNLOCK_TTL_MS;
  return `${exp}.${sign(userId, exp)}`;
}

export function verifyUnlockToken(
  token: string | undefined,
  userId: string,
): boolean {
  if (!token || !passcodeConfigured()) return false;
  const [expStr, mac] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now() || !mac) return false;
  const expected = sign(userId, exp);
  try {
    const a = Buffer.from(mac, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminUnlocked(userId: string): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return verifyUnlockToken(token, userId);
}

/** Admin + passed step-up re-auth. Redirects to the unlock screen otherwise. */
export async function requireAdminUnlocked(): Promise<AdminContext> {
  const ctx = await requireAdmin();
  if (!(await isAdminUnlocked(ctx.userId))) redirect("/admin/unlock");
  return ctx;
}
