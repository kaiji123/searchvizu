import "server-only";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

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

export async function saveIntakeRequest(req: IntakeRequest): Promise<void> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.INTAKE_SECRET;
  if (!url || !secret) throw new Error("Public intake is not configured.");
  await new ConvexHttpClient(url).mutation(api.studio.submitPublicRequest, { ...req, secret });
}
