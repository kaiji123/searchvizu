"use client";

import { useState, type FormEvent } from "react";
import { useAuthToken } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const endpoint = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
const maxSize = 10 * 1024 * 1024;

export function ProjectFiles({ requestId }: { requestId: Id<"requests"> }) {
  const token = useAuthToken();
  const files = useQuery(api.projectFiles.list, { requestId });
  const admin = useQuery(api.studio.isAdmin, {});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size || file.size > maxSize) { setMessage("Choose a non-empty file up to 10 MiB."); return; }
    if (!token || !endpoint) { setMessage("File storage is not available. Please sign in again."); return; }
    setBusy(true); setMessage("");
    try {
      const url = new URL("/project-file", endpoint);
      url.searchParams.set("requestId", requestId);
      url.searchParams.set("kind", String(data.get("kind") ?? "input"));
      url.searchParams.set("name", file.name);
      const result = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/octet-stream" }, body: file });
      if (!result.ok) throw new Error("Upload failed");
      form.reset(); setMessage("File uploaded.");
    } catch { setMessage("Could not upload the file. Please try again."); }
    finally { setBusy(false); }
  }
  async function download(fileId: Id<"projectFiles">, name: string) {
    if (!token || !endpoint) { setMessage("File storage is not available. Please sign in again."); return; }
    setMessage("");
    try {
      const url = new URL("/project-file", endpoint); url.searchParams.set("fileId", fileId);
      const result = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!result.ok) throw new Error("Download failed");
      const localUrl = URL.createObjectURL(await result.blob());
      const link = document.createElement("a"); link.href = localUrl; link.download = name; link.click();
      setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
    } catch { setMessage("Could not download the file. Please try again."); }
  }
  return <section className="mt-8 rounded-xl border border-line bg-surface p-6 sm:p-8"><h2 className="text-xl font-semibold">Project files</h2><p className="mt-2 text-sm text-muted">Files are available to the project owner and studio. Maximum 10 MiB per file.</p>{!endpoint ? <p className="mt-4 text-sm text-muted">File storage is not configured.</p> : <form onSubmit={upload} className="mt-5 grid gap-3"><label className="grid gap-1 text-sm font-medium">Choose a file<input type="file" name="file" className="field" required /></label>{admin && <label className="grid gap-1 text-sm font-medium">File purpose<select className="field" name="kind"><option value="input">Research material</option><option value="deliverable">Deliverable for researcher</option></select></label>}<button className="btn-secondary justify-self-start" disabled={busy}>{busy ? "Uploading…" : "Upload file"}</button></form>}{message && <p role="status" className="mt-3 text-sm text-muted">{message}</p>}<div className="mt-5 grid gap-2">{files === undefined ? <p role="status" className="text-sm text-muted">Loading files…</p> : files.length === 0 ? <p className="text-sm text-muted">No files yet.</p> : files.map(file => <div key={file._id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line p-3"><div className="min-w-0"><p className="break-all text-sm font-medium">{file.name}</p><p className="mt-1 text-xs text-muted">{file.kind === "input" ? "Research material" : "Deliverable"} · {(file.size / 1024).toFixed(1)} KiB</p></div><button type="button" className="text-sm font-medium text-accent underline underline-offset-2" onClick={() => void download(file._id, file.name)}>Download</button></div>)}</div></section>;
}
