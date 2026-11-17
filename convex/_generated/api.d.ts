/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as intakeEmails from "../intakeEmails.js";
import type * as projectFiles from "../projectFiles.js";
import type * as projects from "../projects.js";
import type * as publicationTypes from "../publicationTypes.js";
import type * as publications from "../publications.js";
import type * as requests from "../requests.js";
import type * as studio from "../studio.js";
import type * as users from "../users.js";
import type * as workspace from "../workspace.js";
import type * as workspaceFiles from "../workspaceFiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  intakeEmails: typeof intakeEmails;
  projectFiles: typeof projectFiles;
  projects: typeof projects;
  publicationTypes: typeof publicationTypes;
  publications: typeof publications;
  requests: typeof requests;
  studio: typeof studio;
  users: typeof users;
  workspace: typeof workspace;
  workspaceFiles: typeof workspaceFiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  auth: import("@convex-dev/auth/_generated/component.js").ComponentApi<"auth">;
  authPassword: import("@convex-dev/auth/components/password/_generated/component.js").ComponentApi<"authPassword">;
  authUsername: import("@convex-dev/auth/components/username/_generated/component.js").ComponentApi<"authUsername">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
};
