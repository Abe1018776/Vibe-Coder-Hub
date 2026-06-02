"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
