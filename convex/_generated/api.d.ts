/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as articles from "../articles.js";
import type * as auth from "../auth.js";
import type * as exa from "../exa.js";
import type * as http from "../http.js";
import type * as minimax from "../minimax.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as workflowTasks from "../workflowTasks.js";
import type * as workflow_helpers from "../workflow/helpers.js";
import type * as workflow_validators from "../workflow/validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  articles: typeof articles;
  auth: typeof auth;
  exa: typeof exa;
  http: typeof http;
  minimax: typeof minimax;
  quizzes: typeof quizzes;
  seed: typeof seed;
  users: typeof users;
  workflowTasks: typeof workflowTasks;
  "workflow/helpers": typeof workflow_helpers;
  "workflow/validators": typeof workflow_validators;
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

export declare const components: {};
