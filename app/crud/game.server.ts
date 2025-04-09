import { asc, desc, eq, sql } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import {
  gameIterationTable,
  gameTable,
  userTable,
  type CreateGame,
  type CreateGameIteration,
  type Game,
  type GameIteration,
} from "../../database/schema";

// Sort options type for game iterations
export type GameIterationQueryOptions = {
  sortBy: "id" | "game_id" | "created_at" | "updated_at" | "content";
  direction: "asc" | "desc";
  limit?: number;
};

// Game CRUD operations
export async function createGame(db: AppLoadContext["db"], data: CreateGame) {
  const [game] = await db.insert(gameTable).values(data).returning({
    id: gameTable.id,
    name: gameTable.name,
    creator_id: gameTable.creator_id,
    play_count: gameTable.play_count,
    created_at: gameTable.created_at,
    updated_at: gameTable.updated_at,
  });
  return game;
}

export async function getGame(db: AppLoadContext["db"], id: number) {
  const [game] = await db
    .select({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      play_count: gameTable.play_count,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
      creator: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(gameTable)
    .innerJoin(userTable, eq(gameTable.creator_id, userTable.id))
    .where(eq(gameTable.id, id))
    .limit(1);

  if (!game) return null;

  return game;
}

export async function getGames(db: AppLoadContext["db"], search?: string) {
  const games = await db
    .select({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      play_count: gameTable.play_count,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
      creator: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(gameTable)
    .innerJoin(userTable, eq(gameTable.creator_id, userTable.id))
    .where(
      search
        ? sql`LOWER(${gameTable.name}) LIKE LOWER(${"%" + search + "%"})`
        : undefined
    )
    .orderBy(desc(gameTable.created_at));

  return games;
}

export async function getGamesByUserId(
  db: AppLoadContext["db"],
  userId: number
) {
  const games = await db
    .select({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      play_count: gameTable.play_count,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
      creator: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(gameTable)
    .innerJoin(userTable, eq(gameTable.creator_id, userTable.id))
    .where(eq(gameTable.creator_id, userId));

  return games;
}

export async function updateGame(
  db: AppLoadContext["db"],
  id: number,
  data: Partial<CreateGame>
): Promise<Game | null> {
  const [game] = await db
    .update(gameTable)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(eq(gameTable.id, id))
    .returning({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      play_count: gameTable.play_count,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
    });

  if (!game) return null;

  return game;
}

export async function deleteGame(
  db: AppLoadContext["db"],
  id: number
): Promise<boolean> {
  const [result] = await db
    .delete(gameTable)
    .where(eq(gameTable.id, id))
    .returning();
  return !!result;
}

// Add a new function to increment play count
export async function incrementGamePlayCount(
  db: AppLoadContext["db"],
  id: number
): Promise<Game | null> {
  const [game] = await db
    .update(gameTable)
    .set({
      play_count: sql`${gameTable.play_count} + 1`,
      updated_at: new Date().toISOString(),
    })
    .where(eq(gameTable.id, id))
    .returning({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      play_count: gameTable.play_count,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
    });

  if (!game) return null;

  return game;
}

// Game Iteration CRUD operations
export async function createGameIteration(
  db: AppLoadContext["db"],
  data: CreateGameIteration
): Promise<GameIteration> {
  const [iteration] = await db
    .insert(gameIterationTable)
    .values(data)
    .returning();
  return iteration;
}

export async function getGameIteration(
  db: AppLoadContext["db"],
  id: number
): Promise<GameIteration | null> {
  const [iteration] = await db
    .select()
    .from(gameIterationTable)
    .where(eq(gameIterationTable.id, id))
    .limit(1);
  return iteration || null;
}

export async function getGameIterationsByGameId(
  db: AppLoadContext["db"],
  gameId: number,
  query?: GameIterationQueryOptions
): Promise<GameIteration[]> {
  return db
    .select()
    .from(gameIterationTable)
    .where(eq(gameIterationTable.game_id, gameId))
    .orderBy(
      query
        ? query.direction === "desc"
          ? desc(gameIterationTable[query.sortBy])
          : asc(gameIterationTable[query.sortBy])
        : desc(gameIterationTable.created_at)
    )
    .limit(query?.limit ?? Number.MAX_SAFE_INTEGER);
}

export async function updateGameIteration(
  db: AppLoadContext["db"],
  id: number,
  data: Partial<CreateGameIteration>
): Promise<GameIteration | null> {
  const [iteration] = await db
    .update(gameIterationTable)
    .set({ ...data, updated_at: new Date().toISOString() })
    .where(eq(gameIterationTable.id, id))
    .returning();
  return iteration || null;
}

export async function deleteGameIteration(
  db: AppLoadContext["db"],
  id: number
): Promise<boolean> {
  const [result] = await db
    .delete(gameIterationTable)
    .where(eq(gameIterationTable.id, id))
    .returning();
  return !!result;
}
