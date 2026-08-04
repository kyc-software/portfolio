/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assistant from "../assistant.js";
import type * as candidates from "../candidates.js";
import type * as embeddings from "../embeddings.js";
import type * as faqCatalog from "../faqCatalog.js";
import type * as http from "../http.js";
import type * as rateLimits from "../rateLimits.js";
import type * as routing from "../routing.js";
import type * as speech from "../speech.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assistant: typeof assistant;
  candidates: typeof candidates;
  embeddings: typeof embeddings;
  faqCatalog: typeof faqCatalog;
  http: typeof http;
  rateLimits: typeof rateLimits;
  routing: typeof routing;
  speech: typeof speech;
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
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
