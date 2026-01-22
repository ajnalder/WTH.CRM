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
import type * as aiSettings from "../aiSettings.js";
import type * as checklists from "../checklists.js";
import type * as clients from "../clients.js";
import type * as companySettings from "../companySettings.js";
import type * as contacts from "../contacts.js";
import type * as domains from "../domains.js";
import type * as emailCampaigns from "../emailCampaigns.js";
import type * as emailLogs from "../emailLogs.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as ideas from "../ideas.js";
import type * as invoiceItems from "../invoiceItems.js";
import type * as invoicePDF from "../invoicePDF.js";
import type * as invoicePayments from "../invoicePayments.js";
import type * as invoices from "../invoices.js";
import type * as klaviyo from "../klaviyo.js";
import type * as profiles from "../profiles.js";
import type * as projectNotes from "../projectNotes.js";
import type * as projectTeamMembers from "../projectTeamMembers.js";
import type * as projects from "../projects.js";
import type * as promoAi from "../promoAi.js";
import type * as promoCampaignResults from "../promoCampaignResults.js";
import type * as promoClients from "../promoClients.js";
import type * as promoProducts from "../promoProducts.js";
import type * as promoPromotions from "../promoPromotions.js";
import type * as promoUtils from "../promoUtils.js";
import type * as quoteBlocks from "../quoteBlocks.js";
import type * as quoteEvents from "../quoteEvents.js";
import type * as quoteItems from "../quoteItems.js";
import type * as quoteNotifications from "../quoteNotifications.js";
import type * as quotes from "../quotes.js";
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
  aiSettings: typeof aiSettings;
  checklists: typeof checklists;
  clients: typeof clients;
  companySettings: typeof companySettings;
  contacts: typeof contacts;
  domains: typeof domains;
  emailCampaigns: typeof emailCampaigns;
  emailLogs: typeof emailLogs;
  emailTemplates: typeof emailTemplates;
  files: typeof files;
  http: typeof http;
  ideas: typeof ideas;
  invoiceItems: typeof invoiceItems;
  invoicePDF: typeof invoicePDF;
  invoicePayments: typeof invoicePayments;
  invoices: typeof invoices;
  klaviyo: typeof klaviyo;
  profiles: typeof profiles;
  projectNotes: typeof projectNotes;
  projectTeamMembers: typeof projectTeamMembers;
  projects: typeof projects;
  promoAi: typeof promoAi;
  promoCampaignResults: typeof promoCampaignResults;
  promoClients: typeof promoClients;
  promoProducts: typeof promoProducts;
  promoPromotions: typeof promoPromotions;
  promoUtils: typeof promoUtils;
  quoteBlocks: typeof quoteBlocks;
  quoteEvents: typeof quoteEvents;
  quoteItems: typeof quoteItems;
  quoteNotifications: typeof quoteNotifications;
  quotes: typeof quotes;
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
