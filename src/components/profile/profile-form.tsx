"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { updateProfile, type ProfileFormState } from "@/lib/actions/profile";
import { ImageInput } from "@/components/brand/image-input";
import { KNOWN_TOOLS } from "@/lib/site";
import type { Profile } from "@/lib/queries";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15";

function Field({
  label,
  children,
  required,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {required && <span className="ml-0.5 text-clay-mid">*</span>}
        {hint && (
          <span className="ml-2 font-normal text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-clay-deep">{error}</p>}
    </div>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    {},
  );
  const links = (profile.links ?? {}) as Record<string, string | undefined>;

  const [tools, setTools] = useState<string[]>(profile.tools ?? []);
  const [customTool, setCustomTool] = useState("");

  const toggleTool = (t: string) =>
    setTools((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const addCustom = () => {
    const t = customTool.trim();
    if (t && !tools.includes(t)) setTools((cur) => [...cur, t]);
    setCustomTool("");
  };
  const chipTools = [...new Set([...KNOWN_TOOLS, ...tools])];

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </div>
      )}

      <Field label="Profile photo">
        <ImageInput
          name="avatar_url"
          bucket="avatars"
          shape="circle"
          defaultValue={profile.avatar_url}
          fallbackInitial={profile.name.slice(0, 1).toUpperCase()}
        />
      </Field>

      <Field label="Cover image" hint="your profile banner — optional">
        <ImageInput
          name="cover_url"
          bucket="avatars"
          shape="rect"
          defaultValue={profile.cover_url}
        />
      </Field>

      <Field label="Display name" required error={state.fieldErrors?.name}>
        <input
          name="name"
          defaultValue={profile.name}
          maxLength={80}
          className={inputClass}
          placeholder="Your name"
        />
      </Field>

      <Field
        label="Handle"
        hint="yidvibe.com/u/your-handle"
        error={state.fieldErrors?.handle}
      >
        <input
          name="handle"
          defaultValue={profile.handle}
          className={cn(inputClass, "font-mono")}
          placeholder="your-handle"
        />
      </Field>

      <Field label="Bio">
        <textarea
          name="bio"
          defaultValue={profile.bio ?? ""}
          maxLength={600}
          rows={4}
          className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          placeholder="A short intro — what you build, your background, your passion…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Hourly rate ($)">
          <input
            name="hourly_rate"
            type="number"
            min={0}
            step={1}
            defaultValue={profile.hourly_rate ?? ""}
            className={inputClass}
            placeholder="75"
          />
        </Field>
        <Field label="Location">
          <input
            name="location"
            defaultValue={profile.location ?? ""}
            maxLength={80}
            className={inputClass}
            placeholder="Brooklyn, NY"
          />
        </Field>
      </div>

      <Field label="Tools you use">
        <div className="flex flex-wrap gap-2">
          {chipTools.map((t) => {
            const active = tools.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleTool(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-blue-mid bg-blue-tint text-blue-deep"
                    : "border-border bg-surface text-muted-foreground hover:border-border-hover",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={customTool}
            onChange={(e) => setCustomTool(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Add another tool"
            className={cn(inputClass, "h-9 max-w-xs")}
          />
          <button type="button" onClick={addCustom} className="btn btn-ghost btn-sm">
            <Plus size={15} /> Add
          </button>
        </div>
        {tools.map((t) => (
          <input key={t} type="hidden" name="tools" value={t} />
        ))}
      </Field>

      <Field label="Skills" hint="comma separated">
        <input
          name="skills"
          defaultValue={(profile.skills ?? []).join(", ")}
          className={inputClass}
          placeholder="React, AI prompting, UI design, backend"
        />
      </Field>

      <label className="flex cursor-pointer items-center justify-between rounded-card border border-border bg-secondary/40 px-4 py-3">
        <span>
          <span className="block text-sm font-medium text-ink">
            Available for hire
          </span>
          <span className="block text-xs text-muted-foreground">
            Show a green &ldquo;Available&rdquo; badge on your profile
          </span>
        </span>
        <input
          type="checkbox"
          name="available_for_hire"
          defaultChecked={profile.available_for_hire}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-sage-mid after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
      </label>

      <Field
        label="Contact (public)"
        hint="people use these to reach you — fill what you want shown"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input name="link_email" type="email" defaultValue={links.email ?? ""} className={inputClass} placeholder="Email" />
          <input name="link_phone" defaultValue={links.phone ?? ""} className={inputClass} placeholder="Phone" />
          <input name="link_whatsapp" defaultValue={links.whatsapp ?? ""} className={inputClass} placeholder="WhatsApp number" />
          <input name="link_instagram" defaultValue={links.instagram ?? ""} className={inputClass} placeholder="Instagram @handle" />
        </div>
      </Field>

      <Field label="Links">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input name="link_website" defaultValue={links.website ?? ""} className={inputClass} placeholder="Website" />
          <input name="link_github" defaultValue={links.github ?? ""} className={inputClass} placeholder="GitHub" />
          <input name="link_x" defaultValue={links.x ?? ""} className={inputClass} placeholder="X / Twitter" />
          <input name="link_linkedin" defaultValue={links.linkedin ?? ""} className={inputClass} placeholder="LinkedIn" />
        </div>
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="btn-sweep inline-flex h-12 w-full items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
