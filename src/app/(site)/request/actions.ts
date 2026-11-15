"use server";

import { randomUUID } from "node:crypto";
import { saveIntakeRequest, type IntakeRequest } from "@/lib/intake";
import { PACKAGE_OPTIONS, ROLE_OPTIONS, SHARING_OPTIONS, USE_OPTIONS } from "@/lib/intake-options";
import type { FieldName, IntakeState } from "./types";

const str = (fd: FormData, k: string, max = 500) => String(fd.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitIntake(_prev: IntakeState, fd: FormData): Promise<IntakeState> {
  const values = {
    name: str(fd, "name", 120),
    email: str(fd, "email", 200),
    institution: str(fd, "institution", 200),
    role: str(fd, "role", 60),
    package: str(fd, "package", 40),
    topic: str(fd, "topic", 200),
    description: str(fd, "description", 5000),
    materialsUrl: str(fd, "materialsUrl", 1000),
    uses: fd.getAll("uses").map(String).filter((u) => (USE_OPTIONS as readonly string[]).includes(u)),
    deadline: str(fd, "deadline", 20),
    sharing: str(fd, "sharing", 40),
    embargoUntil: str(fd, "embargoUntil", 20),
  };

  // Honeypot: real people never see or fill this field.
  if (str(fd, "website")) return { status: "success", name: values.name };

  const errors: Partial<Record<FieldName, string>> = {};
  if (!values.name) errors.name = "Please tell us your name.";
  if (!EMAIL.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.role && !(ROLE_OPTIONS as readonly string[]).includes(values.role)) errors.role = "Choose one of the options.";
  if (!(PACKAGE_OPTIONS as readonly string[]).includes(values.package)) errors.package = "Choose a visualisation type.";
  if (!values.topic) errors.topic = "A short title helps us scope the work.";
  if (values.description.length < 30) errors.description = "Please describe the research in a few sentences (at least 30 characters).";
  if (values.materialsUrl) {
    try {
      const u = new URL(values.materialsUrl);
      if (!/^https?:$/.test(u.protocol)) throw new Error();
    } catch {
      errors.materialsUrl = "Enter a full link starting with https://";
    }
  }
  if (values.deadline && Number.isNaN(Date.parse(values.deadline))) errors.deadline = "Enter a valid date.";
  if (!(SHARING_OPTIONS as readonly string[]).includes(values.sharing)) errors.sharing = "Tell us whether the work can be shared.";
  if (values.sharing === "embargoed" && Number.isNaN(Date.parse(values.embargoUntil)))
    errors.embargoUntil = "Enter the date the embargo lifts.";

  if (Object.keys(errors).length) {
    return { status: "error", message: "Please fix the highlighted fields.", errors, values };
  }

  const request: IntakeRequest = {
    id: randomUUID(),
    receivedAt: new Date().toISOString(),
    ...values,
    package: values.package as IntakeRequest["package"],
    sharing: values.sharing as IntakeRequest["sharing"],
    embargoUntil: values.sharing === "embargoed" ? values.embargoUntil : "",
  };

  try {
    await saveIntakeRequest(request);
  } catch (err) {
    console.error("Failed to save intake request", err);
    return {
      status: "error",
      message: "Something went wrong saving your request. Please try again in a moment.",
      errors: {},
      values,
    };
  }

  return { status: "success", name: values.name };
}
