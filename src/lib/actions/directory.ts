"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUnlocked } from "@/lib/admin";
import { DIRECTORY_CATEGORIES } from "@/lib/site";

export type DirectoryListingState = { ok?: boolean; error?: string };

/** Anyone (no signup needed) can apply to be listed in the Directory. */
export async function createDirectoryListing(
  _prev: DirectoryListingState,
  formData: FormData,
): Promise<DirectoryListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = String(formData.get("name") ?? "").trim();
  const what = String(formData.get("what_you_do") ?? "").trim();
  const wants = String(formData.get("wants") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const email = String(formData.get("contact_email") ?? "").trim();
  const phone = String(formData.get("contact_phone") ?? "").trim();
  const website = String(formData.get("contact_website") ?? "").trim();

  if (!name || !what || !category) {
    return { error: "Please fill in your name, what you do, and a category." };
  }
  if (!DIRECTORY_CATEGORIES.includes(category)) {
    return { error: "Please pick a category." };
  }
  if (!email && !phone && !website) {
    return { error: "Add at least one way for people to reach you." };
  }

  const contact: Record<string, string> = {};
  if (email) contact.email = email;
  if (phone) contact.phone = phone;
  if (website)
    contact.website = /^https?:\/\//i.test(website) ? website : `https://${website}`;

  const { error } = await supabase.from("directory_listings").insert({
    name: name.slice(0, 120),
    what_you_do: what.slice(0, 600),
    wants: wants ? wants.slice(0, 600) : null,
    category,
    contact,
    submitted_by: user?.id ?? null,
  });
  if (error) return { error: "Couldn't submit your listing. Please try again." };
  return { ok: true };
}

/** Admin-only: approve or reject a directory listing. */
export async function setDirectoryListingStatus(
  id: string,
  status: "approved" | "rejected",
) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("directory_listings").update({ status }).eq("id", id);
  revalidatePath("/admin/directory");
  revalidatePath("/admin");
  revalidatePath("/directory");
}
