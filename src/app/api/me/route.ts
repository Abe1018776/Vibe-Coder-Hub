import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth";

export async function GET() {
  const { userId, isAdmin } = await getAdminContext();
  return NextResponse.json({ userId, isAdmin });
}
