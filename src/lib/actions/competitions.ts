"use server";

import { z } from "zod";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export type CompetitionFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Brief is required").max(4000),
  deadline: z.string().trim().min(1, "Deadline is required"),
  loom_url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});

function csv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCompetition(
  _prev: CompetitionFormState,
  formData: FormData,
): Promise<CompetitionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to post a competition." };

  const parsed = schema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    deadline: String(formData.get("deadline") ?? ""),
    loom_url: String(formData.get("loom_url") ?? ""),
  });
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path[0];
      if (typeof k === "string" && !fe[k]) fe[k] = issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors: fe };
  }
  const v = parsed.data;

  const prize = Number(String(formData.get("prize_amount") ?? "").trim());
  if (!Number.isFinite(prize) || prize <= 0) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { prize_amount: "Enter a prize amount" },
    };
  }

  const deadlineDate = new Date(v.deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: { deadline: "Enter a valid date and time" },
    };
  }

  const slug = `${slugify(v.title) || "competition"}-${nanoid(6)}`;

  const { error } = await supabase.from("competitions").insert({
    creator_id: user.id,
    title: v.title,
    description: v.description,
    prize_amount: prize,
    deadline: deadlineDate.toISOString(),
    tags: csv(formData.get("tags")),
    loom_url: v.loom_url || null,
    slug,
  });
  if (error) return { error: "Couldn't post your competition. Try again." };

  revalidatePath("/competitions");
  redirect(`/competitions/${slug}`);
}

export type SubmissionState = { error?: string; ok?: boolean };

const submissionSchema = z.object({
  submission_url: z.string().trim().url("Enter a valid project URL"),
  loom_url: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional(),
});

export async function submitEntry(
  competitionId: string,
  slug: string,
  _prev: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in to submit an entry." };

  const parsed = submissionSchema.safeParse({
    submission_url: String(formData.get("submission_url") ?? ""),
    loom_url: String(formData.get("loom_url") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your entry." };
  }
  const v = parsed.data;

  const { error } = await supabase.from("competition_submissions").insert({
    competition_id: competitionId,
    submitter_id: user.id,
    submission_url: v.submission_url,
    loom_url: v.loom_url || null,
    description: v.description ?? null,
  });
  if (error) return { error: "Couldn't submit your entry. Please try again." };

  revalidatePath(`/competitions/${slug}`);
  return { ok: true };
}

export async function pickWinner(
  competitionId: string,
  slug: string,
  submissionId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("competitions")
    .update({ winner_submission_id: submissionId, status: "closed" })
    .eq("id", competitionId)
    .eq("creator_id", user.id);

  revalidatePath(`/competitions/${slug}`);
}
