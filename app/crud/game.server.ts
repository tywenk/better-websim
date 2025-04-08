import { eq } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import {
  gameIterationTable,
  gameTable,
  type CreateGame,
  type CreateGameIteration,
  type Game,
  type GameIteration,
} from "../../database/schema";

// Game CRUD operations
export async function createGame(
  db: AppLoadContext["db"],
  data: CreateGame
): Promise<Game> {
  const [game] = await db.insert(gameTable).values(data).returning({
    id: gameTable.id,
    name: gameTable.name,
    creator_id: gameTable.creator_id,
    created_at: gameTable.created_at,
    updated_at: gameTable.updated_at,
  });
  return game;
}

export async function getGame(
  db: AppLoadContext["db"],
  id: number
): Promise<Game | null> {
  const [game] = await db
    .select({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
    })
    .from(gameTable)
    .where(eq(gameTable.id, id))
    .limit(1);
  return game || null;
}

export async function getGamesByUserId(
  db: AppLoadContext["db"],
  userId: number
): Promise<Game[]> {
  return db
    .select({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
    })
    .from(gameTable)
    .where(eq(gameTable.creator_id, userId));
}

export async function updateGame(
  db: AppLoadContext["db"],
  id: number,
  data: Partial<CreateGame>
): Promise<Game | null> {
  const [game] = await db
    .update(gameTable)
    .set({ ...data, updated_at: new Date() })
    .where(eq(gameTable.id, id))
    .returning({
      id: gameTable.id,
      name: gameTable.name,
      creator_id: gameTable.creator_id,
      created_at: gameTable.created_at,
      updated_at: gameTable.updated_at,
    });
  return game || null;
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
  gameId: number
): Promise<GameIteration[]> {
  return db
    .select()
    .from(gameIterationTable)
    .where(eq(gameIterationTable.game_id, gameId))
    .orderBy(gameIterationTable.created_at);
}

export async function updateGameIteration(
  db: AppLoadContext["db"],
  id: number,
  data: Partial<CreateGameIteration>
): Promise<GameIteration | null> {
  const [iteration] = await db
    .update(gameIterationTable)
    .set({ ...data, updated_at: new Date() })
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
