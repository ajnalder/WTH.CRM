import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("shopify-daily-sync", { hours: 24 }, internal.shopify.syncAllShopifyClients);

export default crons;
