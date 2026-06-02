"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import {
  requireAdmin,
  requireAdminUnlocked,
  makeUnlockToken,
  passcodeConfigured,
  ADMIN_COOKIE_NAME,
} from "@/lib/admin";

export type UnlockState = { error?: string };

/** Step-up re-auth: verify the admin passcode, then set a short-lived unlock cookie. */
export async function unlockAdmin(
  _prev: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const ctx = await requireAdmin();
  if (!passcodeConfigured()) {
    return { error: "Admin passcode isn't configured on the server." };
  }
  const code = String(formData.get("passcode") ?? "");
  if (code !== process.env.ADMIN_PASSCODE) {
    return { error: "Wrong passcode." };
  }
  (await cookies()).set(ADMIN_COOKIE_NAME, makeUnlockToken(ctx.userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/admin",
    maxAge: 60 * 60,
  });
  redirect("/admin");
}

export async function lockAdmin() {
  (await cookies()).delete({ name: ADMIN_COOKIE_NAME, path: "/admin" });
  redirect("/");
}

/** Admin-only: toggle a project's gold "Featured" flag. */
export async function setProjectFeatured(projectId: string, featured: boolean) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("projects").update({ featured }).eq("id", projectId);
  revalidatePath("/");
  revalidatePath("/showcase");
  revalidatePath(`/showcase/${projectId}`);
}

/** Admin-only: approve or reject a submitted competition. */
export async function setCompetitionReviewStatus(
  competitionId: string,
  status: "approved" | "rejected",
) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase
    .from("competitions")
    .update({ review_status: status })
    .eq("id", competitionId);
  revalidatePath("/admin/competitions");
  revalidatePath("/admin");
  revalidatePath("/competitions");
}

// ── Content management: delete + hide ─────────────────────────────────────
// Admin "for all" RLS policies let these writes bypass owner-only checks.

export async function deleteGig(id: string) {
  await requireAdminUnlocked();
  const s = await createClient();
  await s.from("gigs").delete().eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/gigs");
}

export async function deleteCompetition(id: string) {
  await requireAdminUnlocked();
  const s = await createClient();
  await s.from("competitions").delete().eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/competitions");
}

export async function deleteEvent(id: string) {
  await requireAdminUnlocked();
  const s = await createClient();
  await s.from("events").delete().eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/events");
}

/** Admin-only hard delete of a project (the owner-scoped one lives in
 *  actions/projects.ts; this one bypasses the owner check via admin RLS). */
export async function adminDeleteProject(id: string) {
  await requireAdminUnlocked();
  const s = await createClient();
  await s.from("projects").delete().eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/showcase");
  revalidatePath("/");
}

export async function setProjectHidden(id: string, hidden: boolean) {
  await requireAdminUnlocked();
  const s = await createClient();
  await s.from("projects").update({ hidden }).eq("id", id);
  revalidatePath("/admin/content");
  revalidatePath("/showcase");
  revalidatePath("/");
}

// ── Admin posting (post as Official YidVibe or on behalf of a user) ────────

export type AdminPostState = { ok?: boolean; error?: string; slug?: string };

/**
 * Post a gig / competition / event from the admin composer. The content is
 * published immediately (competitions are pre-approved, events are real rows).
 * `post_as` is either "official" (owner = the acting admin, flagged official)
 * or a user id (owner = that user). `posted_as_official` isn't in the generated
 * types yet (migration pending), so inserts are cast with `as any`.
 */
export async function adminPostContent(
  _prev: AdminPostState,
  formData: FormData,
): Promise<AdminPostState> {
  const ctx = await requireAdminUnlocked();
  const supabase = await createClient();

  const type = String(formData.get("type") ?? "");
  const postAs = String(formData.get("post_as") ?? "official");
  const official = postAs === "official";
  const ownerId = official ? ctx.userId : postAs;
  if (!ownerId) return { error: "Pick who this is posted as." };

  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const csv = (k: string) =>
    str(k)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  const numOrNull = (k: string) => {
    const v = str(k);
    if (v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  if (type === "gig") {
    const title = str("title");
    const description = str("description");
    const gigType = str("gig_type");
    if (!title) return { error: "Title is required." };
    if (!description) return { error: "Description is required." };
    if (!["task", "hourly", "build"].includes(gigType))
      return { error: "Pick a gig type." };
    const slug = `${slugify(title) || "gig"}-${nanoid(6)}`;
    const { error } = await supabase.from("gigs").insert({
      poster_id: ownerId,
      type: gigType,
      title,
      description,
      budget_min: gigType === "hourly" ? null : numOrNull("budget_min"),
      budget_max: gigType === "hourly" ? null : numOrNull("budget_max"),
      hourly_rate: gigType === "hourly" ? numOrNull("hourly_rate") : null,
      tags: csv("tags"),
      slug,
      posted_as_official: official,
      status: "open",
    } as any);
    if (error) return { error: "Couldn't post the gig. Please try again." };
    revalidatePath("/gigs");
    revalidatePath("/admin/content");
    return { ok: true, slug: `/gigs/${slug}` };
  }

  if (type === "competition") {
    const title = str("title");
    const description = str("description");
    const deadline = str("deadline");
    const prize = Number(str("prize_amount"));
    if (!title) return { error: "Title is required." };
    if (!description) return { error: "Brief is required." };
    if (!Number.isFinite(prize) || prize <= 0)
      return { error: "Enter a prize amount." };
    const deadlineDate = new Date(deadline);
    if (!deadline || Number.isNaN(deadlineDate.getTime()))
      return { error: "Enter a valid deadline." };
    const slug = `${slugify(title) || "competition"}-${nanoid(6)}`;
    const { error } = await supabase.from("competitions").insert({
      creator_id: ownerId,
      title,
      description,
      prize_amount: prize,
      deadline: deadlineDate.toISOString(),
      tags: csv("tags"),
      slug,
      review_status: "approved",
      posted_as_official: official,
    } as any);
    if (error)
      return { error: "Couldn't post the competition. Please try again." };
    revalidatePath("/competitions");
    revalidatePath("/admin/content");
    return { ok: true, slug: `/competitions/${slug}` };
  }

  if (type === "event") {
    const title = str("title");
    if (!title) return { error: "Title is required." };
    const startsAt = str("starts_at");
    let startsIso: string | null = null;
    if (startsAt) {
      const d = new Date(startsAt);
      if (Number.isNaN(d.getTime()))
        return { error: "Enter a valid date and time." };
      startsIso = d.toISOString();
    }
    const url = str("url");
    const { error } = await supabase.from("events").insert({
      creator_id: ownerId,
      title,
      description: str("description") || null,
      location: str("location") || null,
      starts_at: startsIso,
      url: url || null,
      posted_as_official: official,
    } as any);
    if (error) return { error: "Couldn't post the event. Please try again." };
    revalidatePath("/events");
    revalidatePath("/admin/content");
    return { ok: true, slug: "/events" };
  }

  return { error: "Pick a content type." };
}

/** Admin-only: add (or unhide) a browse-by tag. `tags` isn't in the generated
 *  Supabase types yet (migration not applied), so cast the client to `any`. */
export async function addTag(formData: FormData) {
  await requireAdminUnlocked();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const supabase = (await createClient()) as unknown as {
    from: (t: string) => {
      upsert: (
        row: Record<string, unknown>,
        opts: { onConflict: string },
      ) => Promise<unknown>;
    };
  };
  await supabase.from("tags").upsert(
    {
      label,
      slug: label.toLowerCase().replace(/\s+/g, " "),
      source: "admin",
      is_hidden: false,
    },
    { onConflict: "slug" },
  );
  revalidatePath("/admin/tags");
  revalidatePath("/");
}

/** Admin-only: remove a browse-by tag. */
export async function removeTag(id: string) {
  await requireAdminUnlocked();
  const supabase = (await createClient()) as unknown as {
    from: (t: string) => {
      delete: () => { eq: (col: string, val: string) => Promise<unknown> };
    };
  };
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/tags");
  revalidatePath("/");
}

export type ReportAction = "hide" | "delete" | "dismiss";

/** Act on a report. Admin RLS policies let these writes bypass owner-only checks. */
export async function resolveReport(reportId: string, action: ReportAction) {
  const ctx = await requireAdminUnlocked();
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return;

  const id = report.target_id;
  if (action === "hide") {
    if (report.target_type === "project")
      await supabase.from("projects").update({ hidden: true }).eq("id", id);
    else if (report.target_type === "comment")
      await supabase.from("comments").update({ hidden: true }).eq("id", id);
  } else if (action === "delete") {
    switch (report.target_type) {
      case "project":
        await supabase.from("projects").delete().eq("id", id);
        break;
      case "comment":
        await supabase.from("comments").delete().eq("id", id);
        break;
      case "gig":
        await supabase.from("gigs").delete().eq("id", id);
        break;
      case "competition":
        await supabase.from("competitions").delete().eq("id", id);
        break;
      case "event":
        await supabase.from("events").delete().eq("id", id);
        break;
      // profile deletion is intentionally deferred (heavy cascade) — dismiss instead.
    }
  }

  await supabase
    .from("reports")
    .update({
      status: action === "dismiss" ? "dismissed" : "resolved",
      resolved_by: ctx.userId,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", reportId);

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

type UserFlag = "is_verified" | "is_featured" | "is_admin";

/** Admin-only: toggle a profile flag (verified / featured / admin). */
export async function setUserFlag(
  profileId: string,
  field: UserFlag,
  value: boolean,
) {
  await requireAdminUnlocked();
  if (!["is_verified", "is_featured", "is_admin"].includes(field)) return;
  const supabase = await createClient();
  // `is_featured` isn't in the generated types yet — narrow cast keeps it honest.
  await (supabase.from("profiles") as any).update({ [field]: value }).eq("id", profileId);
  revalidatePath("/admin/users");
  revalidatePath("/builders");
  revalidatePath("/");
}

/** Admin-only: hide or show a profile (is_public). */
export async function setUserPublic(profileId: string, isPublic: boolean) {
  await requireAdminUnlocked();
  const supabase = await createClient();
  await supabase.from("profiles").update({ is_public: isPublic }).eq("id", profileId);
  revalidatePath("/admin/users");
}

/** Admin-only: send a Supabase email invite. Gated on the service-role key. */
export async function inviteUser(
  _prev: { ok?: boolean; error?: string },
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  await requireAdminUnlocked();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter an email." };
  const admin = createAdminClient();
  if (!admin)
    return {
      error:
        "Account invites aren't enabled yet — add SUPABASE_SERVICE_ROLE_KEY in Vercel (see docs/ADMIN_SERVICE_ROLE.md).",
    };
  const { error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { ok: true };
}
