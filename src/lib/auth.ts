import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
