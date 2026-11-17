import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/site/SiteChrome";
import { IntakeForm } from "./IntakeForm";

export const metadata: Metadata = {
  title: "Request a visualisation",
  description: "Tell us about your research and the visualisation you would like to create.",
};

export default function RequestPage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Request a visualisation</h1>
        <p className="mt-2 text-muted">
          Takes about three minutes. Tell us what you&apos;re working on and where you&apos;d like to share it.
        </p>
        <p className="mt-4 text-sm text-muted">Have a researcher account? <a href="/portal" className="text-accent underline underline-offset-2">Open the researcher portal</a>.</p>
        <div className="mt-10">
          {/* The form reads ?package= from the URL, which is request-time data. */}
          <Suspense fallback={<div className="h-[900px] rounded-xl border border-line bg-surface" />}>
            <IntakeForm />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}
