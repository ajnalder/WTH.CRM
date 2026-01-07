/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _utils from "../_utils.js";
import type * as clients from "../clients.js";
import type * as companySettings from "../companySettings.js";
import type * as contacts from "../contacts.js";
import type * as domains from "../domains.js";
import type * as emailCampaigns from "../emailCampaigns.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as invoiceItems from "../invoiceItems.js";
import type * as invoicePayments from "../invoicePayments.js";
import type * as invoices from "../invoices.js";
import type * as projectTeamMembers from "../projectTeamMembers.js";
import type * as projects from "../projects.js";
import type * as quoteNotifications from "../quoteNotifications.js";
import type * as taskFiles from "../taskFiles.js";
import type * as taskPlanning from "../taskPlanning.js";
import type * as tasks from "../tasks.js";
import type * as timeEntries from "../timeEntries.js";
import type * as xero from "../xero.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _utils: typeof _utils;
  clients: typeof clients;
  companySettings: typeof companySettings;
  contacts: typeof contacts;
  domains: typeof domains;
  emailCampaigns: typeof emailCampaigns;
  emailTemplates: typeof emailTemplates;
  invoiceItems: typeof invoiceItems;
  invoicePayments: typeof invoicePayments;
  invoices: typeof invoices;
  projectTeamMembers: typeof projectTeamMembers;
  projects: typeof projects;
  quoteNotifications: typeof quoteNotifications;
  taskFiles: typeof taskFiles;
  taskPlanning: typeof taskPlanning;
  tasks: typeof tasks;
  timeEntries: typeof timeEntries;
  xero: typeof xero;
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
