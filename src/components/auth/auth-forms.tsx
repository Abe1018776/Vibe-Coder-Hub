"use client";

import { useActionState, useState } from "react";
import {
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  type AuthFormState,
} from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function Note({ state }: { state: AuthFormState }) {
  if (state.notice)
    return (
      <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
        {state.notice}
      </p>
    );
  if (state.error)
    return (
      <p className="mt-4 rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
        {state.error}
      </p>
    );
  return null;
}

export function AuthForms({
  next,
  initialMode = "signin",
}: {
  next: string;
  initialMode?: "signin" | "signup";
}) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [signInState, signInAction, signingIn] = useActionState<
    AuthFormState,
    FormData
  >(signInWithPassword, {});
  const [signUpState, signUpAction, signingUp] = useActionState<
    AuthFormState,
    FormData
  >(signUpWithPassword, {});

  return (
    <div className="w-full rounded-card border border-border bg-surface p-7">
      <h1 className="text-center font-display text-[1.6rem] leading-tight text-ink">
        {mode === "signin" ? "Welcome back" : "Join YidVibe"}
      </h1>
      <p className="mt-1.5 text-center text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in to post, upvote, and connect."
          : "One account to show your work, get hired, and more."}
      </p>

      <form action={signInWithGoogle} className="mt-6">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-[10px] border border-border bg-surface px-4 text-[15px] font-medium text-ink transition-colors hover:bg-secondary active:scale-[0.99]"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>

      {mode === "signin" ? (
        <form action={signInAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="Email"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
            placeholder="Password"
          />
          <button
            type="submit"
            disabled={signingIn}
            className="btn-sweep inline-flex h-11 w-full items-center justify-center rounded-[10px] px-4 text-[15px] font-medium transition-transform active:scale-[0.99] disabled:opacity-70"
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
          <Note state={signInState} />
        </form>
      ) : (
        <form action={signUpAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <div>
            <input
              name="name"
              required
              className={inputClass}
              placeholder="Your name"
            />
            {signUpState.fieldErrors?.name && (
              <p className="mt-1 text-xs text-clay-deep">
                {signUpState.fieldErrors.name}
              </p>
            )}
          </div>
          <div>
            <input
              name="username"
              required
              className={cn(inputClass, "font-mono")}
              placeholder="username"
            />
            {signUpState.fieldErrors?.username && (
              <p className="mt-1 text-xs text-clay-deep">
                {signUpState.fieldErrors.username}
              </p>
            )}
          </div>
          <div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClass}
              placeholder="Email"
            />
            {signUpState.fieldErrors?.email && (
              <p className="mt-1 text-xs text-clay-deep">
                {signUpState.fieldErrors.email}
              </p>
            )}
          </div>
          <div>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={inputClass}
              placeholder="Password (8+ characters)"
            />
            {signUpState.fieldErrors?.password && (
              <p className="mt-1 text-xs text-clay-deep">
                {signUpState.fieldErrors.password}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={signingUp}
            className="btn-sweep inline-flex h-11 w-full items-center justify-center rounded-[10px] px-4 text-[15px] font-medium transition-transform active:scale-[0.99] disabled:opacity-70"
          >
            {signingUp ? "Creating…" : "Create account"}
          </button>
          <Note state={signUpState} />
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="font-medium text-teal-700 hover:underline"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-medium text-teal-700 hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
