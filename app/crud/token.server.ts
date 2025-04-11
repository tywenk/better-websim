import { asc, desc, eq, sql } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import {
  gameIterationTable,
  tokenUsageTable,
  userTable,
  type CreateTokenUsage,
  type TokenUsage,
} from "../../database/schema";

// Sort options type for token usage
export type TokenUsageQueryOptions = {
  sortBy:
    | "id"
    | "message_id"
    | "created_at"
    | "model"
    | "input_tokens"
    | "output_tokens";
  direction: "asc" | "desc";
  limit?: number;
};

// Token Usage CRUD operations
export async function createTokenUsage(
  db: AppLoadContext["db"],
  data: CreateTokenUsage
): Promise<TokenUsage> {
  const [tokenUsage] = await db
    .insert(tokenUsageTable)
    .values(data)
    .returning();
  return tokenUsage;
}

export async function getTokenUsage(
  db: AppLoadContext["db"],
  id: number
): Promise<TokenUsage | null> {
  const [tokenUsage] = await db
    .select()
    .from(tokenUsageTable)
    .where(eq(tokenUsageTable.id, id))
    .limit(1);
  return tokenUsage || null;
}

export async function getTokenUsageByMessageId(
  db: AppLoadContext["db"],
  messageId: string
): Promise<TokenUsage | null> {
  const [tokenUsage] = await db
    .select()
    .from(tokenUsageTable)
    .where(eq(tokenUsageTable.message_id, messageId))
    .limit(1);
  return tokenUsage || null;
}

export async function getTokenUsageByUserId(
  db: AppLoadContext["db"],
  userId: number,
  query?: TokenUsageQueryOptions
): Promise<TokenUsage[]> {
  return db
    .select()
    .from(tokenUsageTable)
    .where(eq(tokenUsageTable.user_id, userId))
    .orderBy(
      query
        ? query.direction === "desc"
          ? desc(tokenUsageTable[query.sortBy])
          : asc(tokenUsageTable[query.sortBy])
        : desc(tokenUsageTable.created_at)
    )
    .limit(query?.limit ?? Number.MAX_SAFE_INTEGER);
}

export async function getTokenUsageByGameIterationId(
  db: AppLoadContext["db"],
  gameIterationId: number,
  query?: TokenUsageQueryOptions
): Promise<TokenUsage[]> {
  return db
    .select()
    .from(tokenUsageTable)
    .where(eq(tokenUsageTable.game_iteration_id, gameIterationId))
    .orderBy(
      query
        ? query.direction === "desc"
          ? desc(tokenUsageTable[query.sortBy])
          : asc(tokenUsageTable[query.sortBy])
        : desc(tokenUsageTable.created_at)
    )
    .limit(query?.limit ?? Number.MAX_SAFE_INTEGER);
}

export async function getTokenUsageWithDetails(
  db: AppLoadContext["db"],
  id: number
) {
  const [tokenUsage] = await db
    .select({
      id: tokenUsageTable.id,
      message_id: tokenUsageTable.message_id,
      model: tokenUsageTable.model,
      input_tokens: tokenUsageTable.input_tokens,
      output_tokens: tokenUsageTable.output_tokens,
      created_at: tokenUsageTable.created_at,
      user: {
        id: userTable.id,
        name: userTable.name,
      },
      game_iteration: {
        id: gameIterationTable.id,
        prompt: gameIterationTable.prompt,
        content: gameIterationTable.content,
      },
    })
    .from(tokenUsageTable)
    .innerJoin(userTable, eq(tokenUsageTable.user_id, userTable.id))
    .leftJoin(
      gameIterationTable,
      eq(tokenUsageTable.game_iteration_id, gameIterationTable.id)
    )
    .where(eq(tokenUsageTable.id, id))
    .limit(1);

  return tokenUsage || null;
}

export async function updateTokenUsage(
  db: AppLoadContext["db"],
  id: number,
  data: Partial<CreateTokenUsage>
): Promise<TokenUsage | null> {
  const [tokenUsage] = await db
    .update(tokenUsageTable)
    .set(data)
    .where(eq(tokenUsageTable.id, id))
    .returning();
  return tokenUsage || null;
}

export async function deleteTokenUsage(
  db: AppLoadContext["db"],
  id: number
): Promise<boolean> {
  const [result] = await db
    .delete(tokenUsageTable)
    .where(eq(tokenUsageTable.id, id))
    .returning();
  return !!result;
}

// Utility functions
export async function getTotalTokensByUserId(
  db: AppLoadContext["db"],
  userId: number
) {
  const [result] = await db
    .select({
      total_input_tokens: sql<number>`SUM(${tokenUsageTable.input_tokens})`,
      total_output_tokens: sql<number>`SUM(${tokenUsageTable.output_tokens})`,
    })
    .from(tokenUsageTable)
    .where(eq(tokenUsageTable.user_id, userId))
    .limit(1);

  return {
    totalInputTokens: result?.total_input_tokens ?? 0,
    totalOutputTokens: result?.total_output_tokens ?? 0,
  };
}

export async function getTokenUsageStats(
  db: AppLoadContext["db"],
  userId: number,
  days: number = 30
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const [result] = await db
    .select({
      total_input_tokens: sql<number>`SUM(${tokenUsageTable.input_tokens})`,
      total_output_tokens: sql<number>`SUM(${tokenUsageTable.output_tokens})`,
      avg_input_tokens: sql<number>`AVG(${tokenUsageTable.input_tokens})`,
      avg_output_tokens: sql<number>`AVG(${tokenUsageTable.output_tokens})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(tokenUsageTable)
    .where(
      sql`${tokenUsageTable.user_id} = ${userId} AND ${
        tokenUsageTable.created_at
      } >= ${cutoffDate.toISOString()}`
    )
    .limit(1);

  return {
    totalInputTokens: result?.total_input_tokens ?? 0,
    totalOutputTokens: result?.total_output_tokens ?? 0,
    avgInputTokens: result?.avg_input_tokens ?? 0,
    avgOutputTokens: result?.avg_output_tokens ?? 0,
    count: result?.count ?? 0,
  };
}
