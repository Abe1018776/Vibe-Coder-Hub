"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminUnlocked } from "@/lib/admin";
import { DIRECTORY_CATEGORIES } from "@/lib/site";

export type DirectoryListingState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Your name or business is required.";
  if (!what) fieldErrors.what_you_do = "Tell people what you do.";
  if (!category) fieldErrors.category = "Pick a category.";
  else if (!DIRECTORY_CATEGORIES.includes(category))
    fieldErrors.category = "Pick a category from the list.";
  if (email) {
    if (!EMAIL_RE.test(email))
      fieldErrors.contact_email = "Enter a valid email address.";
  } else if (!phone && !website) {
    fieldErrors.contact_email = "Add at least one way for people to reach you.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the highlighted fields below.", fieldErrors };
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

/** Logged-in self-serve: create the current user's own listing, live immediately. */
export async function createMyDirectoryListing(
  _prev: DirectoryListingState,
  formData: FormData,
): Promise<DirectoryListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to list yourself." };

  const name = String(formData.get("name") ?? "").trim();
  const what = String(formData.get("what_you_do") ?? "").trim();
  const wants = String(formData.get("wants") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const email = String(formData.get("contact_email") ?? "").trim();
  const phone = String(formData.get("contact_phone") ?? "").trim();
  const website = String(formData.get("contact_website") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim();
  const goPublic = String(formData.get("go_public") ?? "") === "on";

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Your name or business is required.";
  if (!what) fieldErrors.what_you_do = "Tell people what you do.";
  if (!category) fieldErrors.category = "Pick a category.";
  else if (!DIRECTORY_CATEGORIES.includes(category))
    fieldErrors.category = "Pick a category from the list.";
  if (email && !EMAIL_RE.test(email))
    fieldErrors.contact_email = "Enter a valid email address.";
  if (!email && !phone && !website)
    fieldErrors.contact_email = "Add at least one way for people to reach you.";
  if (Object.keys(fieldErrors).length > 0)
    return { error: "Please fix the highlighted fields below.", fieldErrors };

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
    logo_url: logoUrl || null,
    status: "approved",
    submitted_by: user.id,
  });
  if (error) return { error: "Couldn't create your listing. Please try again." };

  if (goPublic) {
    await supabase
      .from("profiles")
      .update({ is_public: true, went_public_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  revalidatePath("/directory");
  revalidatePath("/dashboard");
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
