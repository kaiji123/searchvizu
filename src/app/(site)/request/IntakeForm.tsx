"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ROLE_OPTIONS, USE_OPTIONS } from "@/lib/intake-options";
import { submitIntake } from "./actions";
import type { FieldName, IntakeState } from "./types";

const PACKAGE_CHOICES = [
  { value: "figure", label: "2D figure", note: "A clear static visual" },
  { value: "interactive-2d", label: "Interactive 2D", note: "A visual to explore" },
  { value: "interactive-3d", label: "Interactive 3D", note: "A spatial experience" },
  { value: "unsure", label: "Not sure yet", note: "We'll help you decide" },
];

const SHARING_CHOICES = [
  { value: "public-after-approval", label: "Can be shown publicly", note: "Only after you approve the final version" },
  { value: "private", label: "Not for the portfolio", note: "An unlisted link is not access-controlled" },
  { value: "embargoed", label: "Embargoed", note: "Do not publish before the date you set" },
];

export function IntakeForm() {
  const [state, action, pending] = useActionState<IntakeState, FormData>(submitIntake, { status: "idle" });
  const params = useSearchParams();
  const pre = params.get("package");
  const initialPackage = PACKAGE_CHOICES.some((c) => c.value === pre) ? pre! : "";

  const values = state.status === "error" ? state.values : {};
  const errors = state.status === "error" ? state.errors : {};
  const [sharing, setSharing] = useState<string>((values.sharing as string) ?? "");

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-line bg-surface p-8" role="status">
        <h2 className="text-xl font-semibold">Thanks{state.name ? `, ${state.name.split(" ")[0]}` : ""}. Your request is in.</h2>
        <p className="mt-2 text-muted">
          We&apos;ll read your request and get back to you. Nothing is published without your approval.
        </p>
      </div>
    );
  }

  const v = (k: FieldName) => (values[k] as string | undefined) ?? "";

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>
      {state.status === "error" && (
        <div className="rounded-lg border border-[var(--viz-2)] bg-[color-mix(in_oklab,var(--viz-2)_10%,transparent)] px-4 py-3 text-sm" role="alert">
          {state.message}
        </div>
      )}

      {/* Honeypot for bots: hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Group title="About you">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" error={errors.name}>
            <input name="name" className="field" defaultValue={v("name")} autoComplete="name" required />
          </Field>
          <Field label="Email" name="email" error={errors.email}>
            <input name="email" type="email" className="field" defaultValue={v("email")} autoComplete="email" required />
          </Field>
          <Field label="Institution or lab" name="institution" optional>
            <input name="institution" className="field" defaultValue={v("institution")} autoComplete="organization" />
          </Field>
          <Field label="Role" name="role" optional error={errors.role}>
            <select name="role" className="field" defaultValue={v("role")}>
              <option value="">Select…</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
        </div>
      </Group>

      <Group title="What should we visualise?">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Visualisation type</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PACKAGE_CHOICES.map((c) => (
              <Choice key={c.value} type="radio" name="package" value={c.value} label={c.label} note={c.note} defaultChecked={(v("package") || initialPackage) === c.value} />
            ))}
          </div>
          <ErrorText name="package" error={errors.package} />
        </fieldset>
        <Field label="Working title" name="topic" error={errors.topic}>
          <input name="topic" className="field" defaultValue={v("topic")} placeholder="e.g. Age-structured SEIR model of measles transmission" />
        </Field>
        <Field label="Describe the research and what the visual should show" name="description" error={errors.description}>
          <textarea name="description" rows={6} className="field" defaultValue={v("description")} />
        </Field>
        <Field label="Link to paper, preprint, data or code" name="materialsUrl" optional error={errors.materialsUrl} hint="A shared folder link is fine. Please don't upload confidential data at this stage.">
          <input name="materialsUrl" type="url" className="field" defaultValue={v("materialsUrl")} placeholder="https://" />
        </Field>
      </Group>

      <Group title="Use and timing">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            Where will it be used? <span className="font-normal text-muted">(optional)</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {USE_OPTIONS.map((u) => (
              <Choice key={u} type="checkbox" name="uses" value={u} label={u} defaultChecked={((values.uses as string[]) ?? []).includes(u)} />
            ))}
          </div>
        </fieldset>
        <div className="max-w-xs">
          <Field label="Deadline" name="deadline" optional error={errors.deadline}>
            <input name="deadline" type="date" className="field" defaultValue={v("deadline")} />
          </Field>
        </div>
      </Group>

      <Group title="Sharing and confidentiality">
        <fieldset>
          <legend className="sr-only">Can the finished visualisation be shared?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {SHARING_CHOICES.map((c) => (
              <Choice
                key={c.value}
                type="radio"
                name="sharing"
                value={c.value}
                label={c.label}
                note={c.note}
                defaultChecked={sharing === c.value}
                onChange={() => setSharing(c.value)}
              />
            ))}
          </div>
          <ErrorText name="sharing" error={errors.sharing} />
        </fieldset>
        {sharing === "embargoed" && (
          <div className="max-w-xs">
            <Field label="Embargo lifts on" name="embargoUntil" error={errors.embargoUntil}>
              <input name="embargoUntil" type="date" className="field" defaultValue={v("embargoUntil")} />
            </Field>
          </div>
        )}
      </Group>

      <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">Share what you have in mind and we&apos;ll take it from there.</p>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  optional,
  error,
  hint,
  children,
}: {
  label: string;
  name: FieldName;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactElement;
}) {
  return (
    <label className="flex flex-col gap-1.5" data-invalid={error ? "" : undefined}>
      <span className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      <ErrorText name={name} error={error} />
    </label>
  );
}

function ErrorText({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <span id={`${name}-error`} className="mt-1 block text-xs text-[var(--viz-2)]">
      {error}
    </span>
  );
}

function Choice({
  type,
  name,
  value,
  label,
  note,
  defaultChecked,
  onChange,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  note?: string;
  defaultChecked?: boolean;
  onChange?: () => void;
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-lg border border-line bg-surface p-3 text-sm transition has-checked:border-accent has-checked:bg-[color-mix(in_oklab,var(--accent)_8%,var(--surface))]">
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} onChange={onChange} className="mt-0.5 accent-[var(--accent)]" />
      <span>
        <span className="block font-medium">{label}</span>
        {note && <span className="block text-xs text-muted">{note}</span>}
      </span>
    </label>
  );
}
