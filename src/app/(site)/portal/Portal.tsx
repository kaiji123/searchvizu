"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useSignInWithUsernamePassword, useSignUpWithUsernamePassword } from "@convex-dev/auth/methods/username-password/react";
import { api } from "../../../../convex/_generated/api";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { Studio, STATUS_LABELS } from "./Studio";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { projectPath } from "@/lib/project-path";

export function Portal() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return <div className="rounded-xl border border-line bg-surface p-6"><h2 className="font-semibold">The researcher portal is being set up</h2><p className="mt-2 text-sm text-muted">Please use the request form while we prepare the portal.</p><a href="/request" className="btn-secondary mt-4">Request a visualisation</a></div>;
  return <><AuthLoading><p role="status">Loading your account…</p></AuthLoading><Unauthenticated><SignIn /></Unauthenticated><Authenticated><Dashboard /></Authenticated></>;
}

function SignIn() {
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useSignInWithUsernamePassword({ signInWithUsernamePassword: api.auth.signInWithUsernamePassword });
  const signup = useSignUpWithUsernamePassword({ signUpWithUsernamePassword: api.auth.signUpWithUsernamePassword });
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    try {
      const result = creating ? await signup.signUp({ username, password }) : await login.signIn({ username, password });
      if (result.status !== "complete") setError("We couldn't complete that request. Check your details and try again.");
    } catch { setError("We couldn't connect to the portal. Please try again."); }
  }
  return <div className="max-w-md rounded-xl border border-line bg-surface p-6"><h2 className="text-xl font-semibold">{creating ? "Create an account" : "Welcome back"}</h2><p className="mt-2 text-sm text-muted">Sign in to submit and view your research requests.</p><form onSubmit={submit} className="mt-6 grid gap-4"><label className="grid gap-1 text-sm font-medium">Username<input className="field" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></label><label className="grid gap-1 text-sm font-medium">Password<input className="field" type="password" autoComplete={creating ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} required /></label>{error && <p role="alert" className="text-sm text-[var(--viz-2)]">{error}</p>}<button className="btn-primary" disabled={login.pending || signup.pending}>{creating ? "Create account" : "Sign in"}</button></form><button type="button" className="mt-5 text-sm text-accent underline" onClick={() => {setCreating(!creating); setError("");}}>{creating ? "Already have an account? Sign in" : "New here? Create an account"}</button><p className="mt-4 text-xs text-muted">Account recovery is not yet available. This early portal is for testing; please do not submit confidential material.</p></div>;
}

function Dashboard() {
  const { signOut } = useAuthActions();
  const requests = useQuery(api.requests.listMine, {});
  const isAdmin = useQuery(api.studio.isAdmin, {});
  const [studioOpen, setStudioOpen] = useState(false);
  useEffect(() => {
    function showRequests() { setStudioOpen(false); }
    window.addEventListener("portal:show-requests", showRequests);
    return () => window.removeEventListener("portal:show-requests", showRequests);
  }, []);
  const create = useMutation(api.requests.create);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSent(false); setSending(true);
    const form = event.currentTarget, data = new FormData(form);
    try {
      const type = data.get("type");
      if (type !== "figure" && type !== "interactive-2d" && type !== "interactive-3d" && type !== "unsure") throw new Error("Invalid type");
      await create({ name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), institution: String(data.get("institution") ?? ""), title: String(data.get("title") ?? ""), description: String(data.get("description") ?? ""), type, materialsUrl: String(data.get("materialsUrl") ?? "") });
      form.reset(); setSent(true);
    } catch { setError("Could not save your request. Check the fields and try again."); }
    finally { setSending(false); }
  }
  if (studioOpen && isAdmin) return <Studio onBack={() => setStudioOpen(false)} />;
  return <div className="grid gap-10 lg:grid-cols-[1fr_340px]"><section><div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">New request</h2><p className="mt-1 text-sm text-muted">Tell us what you want to bring to life.</p></div><div className="flex gap-2">{isAdmin && <button type="button" className="btn-secondary" onClick={() => setStudioOpen(true)}>Studio dashboard</button>}<button className="btn-secondary" onClick={() => void signOut()}>Sign out</button></div></div><form onSubmit={submit} className="mt-6 grid gap-4"><Field label="Your name"><input name="name" className="field" required maxLength={120}/></Field><Field label="Contact email"><input name="email" className="field" type="email" required maxLength={200}/></Field><Field label="Institution or lab (optional)"><input name="institution" className="field" maxLength={200}/></Field><Field label="Project title"><input name="title" className="field" required maxLength={200}/></Field><Field label="What are you looking for?"><select name="type" className="field"><option value="unsure">Not sure yet</option><option value="figure">2D figure</option><option value="interactive-2d">Interactive 2D</option><option value="interactive-3d">Interactive 3D</option></select></Field><Field label="Describe your research and the visual"><textarea name="description" className="field" rows={6} required minLength={30} maxLength={5000}/></Field><Field label="Link to public materials (optional)"><input name="materialsUrl" className="field" type="url" placeholder="https://" maxLength={1000}/></Field><p className="text-xs text-muted">After submitting, you can upload a file on the project page. This pilot is not ready for confidential or regulated material.</p>{error && <p role="alert" className="text-sm text-[var(--viz-2)]">{error}</p>}{sent && <p role="status" className="text-sm text-accent">Your request has been saved.</p>}<button disabled={sending} className="btn-primary">{sending ? "Saving…" : "Submit request"}</button></form></section><aside id="your-requests" className="scroll-mt-6"><h2 className="text-xl font-semibold">Your requests</h2><p className="mt-1 text-sm text-muted">Only your account and the studio can see these requests.</p>{requests && requests.some((item) => (item.updateVersion ?? 0) > (item.readVersion ?? 0)) && <p role="status" className="mt-3 text-sm font-semibold text-accent">You have new project updates.</p>}<div className="mt-4 grid gap-3">{requests === undefined ? <p role="status" className="text-sm text-muted">Loading requests…</p> : requests.length === 0 ? <p className="rounded-xl border border-line p-4 text-sm text-muted">Your submitted requests will appear here.</p> : requests.map((item: Doc<"requests">) => <MyRequest key={item._id} item={item} />)}</div></aside></div>;
}
function MyRequest({ item }: { item: Doc<"requests"> }) {
  const entry = useQuery(api.requests.myEntry, { requestId: item._id });
  const markRead = useMutation(api.requests.markRead);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const version = item.updateVersion ?? 0;
  const unread = version > (item.readVersion ?? 0);
  async function readUpdate() {
    setMarking(true); setError("");
    try { await markRead({ requestId: item._id, observedVersion: version }); }
    catch { setError("Could not mark this update as read. Please try again."); }
    finally { setMarking(false); }
  }
  return <article className="rounded-xl border border-line bg-surface p-4"><div className="flex items-start justify-between gap-3"><p className="font-semibold">{item.title}</p>{unread && <span className="rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 py-1 text-xs font-semibold text-accent">New update</span>}</div><p className="mt-2 text-xs text-muted">{STATUS_LABELS[item.status]} · {new Date(item._creationTime).toLocaleDateString()}</p><Link href={projectPath(item._id, item.title)} className="mt-3 inline-block text-sm font-medium text-accent underline underline-offset-2">Open private project</Link>{entry && <div className="mt-4 border-t border-line pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-accent">Shared by the studio</p><h3 className="mt-2 font-semibold">{entry.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-muted">{entry.description}</p>{entry.previewUrl && <a href={entry.previewUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-accent underline underline-offset-2">Open preview ↗</a>}</div>}{unread && <button type="button" onClick={readUpdate} disabled={marking} className="mt-4 text-sm font-medium text-accent underline underline-offset-2">{marking ? "Saving…" : "Mark update as read"}</button>}{error && <p role="alert" className="mt-2 text-xs text-[var(--viz-2)]">{error}</p>}</article>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-1.5 text-sm font-medium">{label}{children}</label>; }
