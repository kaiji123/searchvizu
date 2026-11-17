import type { Metadata } from "next";
import { Container } from "@/components/site/SiteChrome";
import { Portal } from "./Portal";

export const metadata: Metadata = { title: "Researcher portal", robots: { index: false, follow: false } };
export default function PortalPage() {
  return <Container className="py-14"><div className="mb-10"><p className="text-sm font-medium text-accent">Your research, made explorable</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Researcher portal</h1></div><Portal /></Container>;
}
