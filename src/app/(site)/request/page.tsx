import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/site/SiteChrome";
import { IntakeForm } from "./IntakeForm";

export const metadata: Metadata = {
  title: "Request a visualisation",
  description: "Tell us about your research and get a fixed-price quote for an interactive visualisation.",
};

export default function RequestPage() {
  return (
    <Container className="py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Request a visualisation</h1>
        <p className="mt-2 text-muted">
          Takes about three minutes. Tell us what you&apos;re working on and where it&apos;ll be used, and we&apos;ll reply with questions or a fixed
          quote.
        </p>
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
