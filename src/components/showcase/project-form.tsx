"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { ImageInput } from "@/components/brand/image-input";
import { KNOWN_TOOLS } from "@/lib/site";
import type { ProjectFormState } from "@/lib/actions/projects";
import type { Project } from "@/lib/queries";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";

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

export function ProjectForm({
  action,
  project,
  submitLabel = "Submit project",
}: {
  action: (
    state: ProjectFormState,
    formData: FormData,
  ) => Promise<ProjectFormState>;
  project?: Project;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProjectFormState,
    FormData
  >(action, {});

  const [tools, setTools] = useState<string[]>(project?.tools ?? []);
  const [customTool, setCustomTool] = useState("");
  const toggleTool = (t: string) =>
    setTools((cur) =>
      cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
    );
  const addCustom = () => {
    const t = customTool.trim();
    if (t && !tools.includes(t)) setTools((cur) => [...cur, t]);
    setCustomTool("");
  };
  const chipTools = [...new Set([...KNOWN_TOOLS, ...tools])];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg bg-clay-tint px-3 py-2 text-sm text-clay-deep">
          {state.error}
        </div>
      )}

      <Field label="Project image" hint="upload or paste a URL">
        <ImageInput
          name="image_url"
          bucket="project-media"
          shape="rect"
          defaultValue={project?.image_url}
        />
      </Field>

      <Field label="Name" required error={state.fieldErrors?.name}>
        <input
          name="name"
          defaultValue={project?.name}
          maxLength={100}
          dir="auto"
          className={inputClass}
          placeholder="What's it called?"
        />
      </Field>

      <Field
        label="Description"
        required
        error={state.fieldErrors?.description}
      >
        <textarea
          name="description"
          defaultValue={project?.description}
          maxLength={2000}
          rows={4}
          dir="auto"
          className="w-full resize-y rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          placeholder="What does it do? Who's it for?"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Live URL" error={state.fieldErrors?.url}>
          <input
            name="url"
            type="url"
            defaultValue={project?.url ?? ""}
            className={inputClass}
            placeholder="https://your-app.com"
          />
        </Field>
        <Field label="Video / demo URL" error={state.fieldErrors?.video_url}>
          <input
            name="video_url"
            type="url"
            defaultValue={project?.video_url ?? ""}
            className={inputClass}
            placeholder="https://loom.com/…"
          />
        </Field>
      </div>

      <Field label="Tools used">
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
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex h-9 items-center gap-1 rounded-[10px] border border-border bg-surface px-3 text-sm text-ink hover:bg-secondary"
          >
            <Plus size={15} /> Add
          </button>
        </div>
        {tools.map((t) => (
          <input key={t} type="hidden" name="tools" value={t} />
        ))}
      </Field>

      <Field label="Tags" hint="comma separated">
        <input
          name="tags"
          defaultValue={(project?.tags ?? []).join(", ")}
          dir="auto"
          className={inputClass}
          placeholder="Community, Productivity, Education"
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-teal-600 px-4 text-[15px] font-medium text-white transition-transform active:scale-[0.99] disabled:opacity-70"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
