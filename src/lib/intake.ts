import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { PACKAGE_OPTIONS, SHARING_OPTIONS } from "./intake-options";

export type IntakeRequest = {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  institution: string;
  role: string;
  package: (typeof PACKAGE_OPTIONS)[number];
  topic: string;
  description: string;
  materialsUrl: string;
  uses: string[];
  deadline: string;
  sharing: (typeof SHARING_OPTIONS)[number];
  embargoUntil: string;
};

// Where requests go, in priority order:
//   1. INTAKE_WEBHOOK_URL – POSTs JSON (Zapier/Make/Slack/n8n/your own API).
//      Use this on serverless hosts like Vercel, where the disk is read-only.
//   2. A local JSONL file in .data/ – fine for development or a single VPS.
// Swap this function for a database insert once you add one.
export async function saveIntakeRequest(req: IntakeRequest): Promise<void> {
  const webhook = process.env.INTAKE_WEBHOOK_URL;
  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Intake webhook responded ${res.status}`);
    return;
  }
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "requests.jsonl"), JSON.stringify(req) + "\n", "utf8");
}
