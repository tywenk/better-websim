import type { ExecutionContext } from "@cloudflare/workers-types";
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";
import * as schema from "./database/schema";

declare global {
  interface CloudflareEnvironment extends Env {
    ANTHROPIC_API_KEY: string;
  }
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      ctx: Omit<ExecutionContext, "props">;
    };
    db: DrizzleD1Database<typeof schema>;
  }
}

type GetLoadContextArgs = {
  request: Request;
  context: Pick<AppLoadContext, "cloudflare">;
};

export function getLoadContext({ context }: GetLoadContextArgs) {
  const db = drizzle(context.cloudflare.env.DB, { schema });

  return {
    cloudflare: context.cloudflare,
    db,
  };
}
