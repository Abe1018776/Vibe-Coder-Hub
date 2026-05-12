import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) {
    return {
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
      userId: null as null,
    };
  }
  return { response: null, userId };
}

export async function getAdminContext(): Promise<{
  userId: string | null;
  isAdmin: boolean;
}> {
  const { userId } = await auth();
  if (!userId) return { userId: null, isAdmin: false };
  const allowed = adminEmails();
  if (allowed.length === 0) return { userId, isAdmin: false };
  const user = await currentUser();
  const emails =
    user?.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) ?? [];
  const isAdmin = emails.some((e) => allowed.includes(e));
  return { userId, isAdmin };
}
