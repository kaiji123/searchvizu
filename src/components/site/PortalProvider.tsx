"use client";

import type { ReactNode } from "react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { api } from "../../../convex/_generated/api";

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = url ? new ConvexReactClient(url) : null;

export function PortalProvider({ children }: { children: ReactNode }) {
  if (!client) return children;
  return <ConvexAuthProvider client={client} api={{ refreshSession: api.auth.refreshSession, signOut: api.auth.signOut, isAuthenticated: api.auth.isAuthenticated }}>{children}</ConvexAuthProvider>;
}
