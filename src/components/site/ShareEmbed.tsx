"use client";

import { useState } from "react";

export function ShareEmbed({ pageUrl, embedUrl, title }: { pageUrl: string; embedUrl: string; title: string }) {
  const snippet = `<iframe src="${embedUrl}" title="${title.replace(/"/g, "&quot;")}" width="100%" height="640" style="border:0;border-radius:12px" loading="lazy" allowfullscreen></iframe>`;
  const [copied, setCopied] = useState<"link" | "embed" | null>(null);

  async function copy(kind: "link" | "embed", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). The text
      // stays visible and selectable, so nothing else is needed.
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => copy("link", pageUrl)}>
          {copied === "link" ? "Link copied" : "Copy link"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => copy("embed", snippet)}>
          {copied === "embed" ? "Embed code copied" : "Copy embed code"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-line bg-canvas p-3 font-mono text-xs text-muted">
        <code>{snippet}</code>
      </pre>
    </div>
  );
}
