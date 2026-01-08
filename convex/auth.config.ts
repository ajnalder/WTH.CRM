import { AuthConfig } from "convex/server";

const authConfig: AuthConfig = {
  providers: [
    {
      domain: process.env.CLERK_ISSUER || "https://workable-hamster-53.clerk.accounts.dev",
      applicationID: "convex", // must match the Clerk JWT template audience/name
    },
  ],
};

export default authConfig;
