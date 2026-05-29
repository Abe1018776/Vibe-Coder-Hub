"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  notice?: string;
};

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  username: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/i,
      "2–32 chars: letters, numbers, dashes",
    ),
  password: z.string().min(8, "At least 8 characters"),
});

function authFieldErrors(parsed: z.SafeParseError<unknown>): AuthFormState {
  const fe: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fe[key]) fe[key] = issue.message;
  }
  return { error: "Please fix the highlighted fields.", fieldErrors: fe };
}

/** Create an account with email + password. Username seeds the public handle. */
export async function signUpWithPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const next = String(formData.get("next") || "/");
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    username: String(formData.get("username") ?? "").toLowerCase(),
    password: formData.get("password"),
  });
  if (!parsed.success) return authFieldErrors(parsed);
  const v = parsed.data;

  const supabase = await createClient();
  const origin = siteOrigin((await headers()).get("origin"));
  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password: v.password,
    options: {
      data: { name: v.name, full_name: v.name, username: v.username },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (/registered|already/i.test(error.message)) {
      return {
        error: "That email already has an account — try signing in.",
        fieldErrors: { email: "Already registered" },
      };
    }
    return { error: error.message };
  }

  // If email confirmation is required, there's no session yet.
  if (!data.session) {
    return {
      notice:
        "Check your email to confirm your account, then sign in. (Didn't get it? Check spam.)",
    };
  }
  redirect(next);
}

/** Sign in with an existing email + password. */
export async function signInWithPassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const next = String(formData.get("next") || "/");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Wrong email or password — please try again." };
  }
  redirect(next);
}

function siteOrigin(originHeader: string | null): string {
  return (
    originHeader ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

/** Start Google OAuth. Redirects the browser to Google's consent screen. */
export async function signInWithGoogle(formData: FormData) {
  const next = (formData.get("next") as string) || "/";
  const supabase = await createClient();
  const origin = siteOrigin((await headers()).get("origin"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  if (data?.url) {
    redirect(data.url);
  }
  redirect("/login?error=unknown");
}

/** Sign out and return to the landing page. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
