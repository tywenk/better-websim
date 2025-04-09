import { desc, eq, inArray } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import {
  friendshipTable,
  gameTable,
  gameVisitTable,
  userTable,
} from "../../database/schema";

export async function createGameVisit(
  db: AppLoadContext["db"],
  userId: number,
  gameId: number
) {
  const [visit] = await db
    .insert(gameVisitTable)
    .values({
      user_id: userId,
      game_id: gameId,
    })
    .returning();

  return visit;
}

export async function getRecentGameVisits(
  db: AppLoadContext["db"],
  userId: number,
  { limit = 10 }: { limit?: number } = {}
) {
  const visits = await db
    .select({
      id: gameVisitTable.id,
      visited_at: gameVisitTable.visited_at,
      game: {
        id: gameTable.id,
        name: gameTable.name,
      },
    })
    .from(gameVisitTable)
    .innerJoin(gameTable, eq(gameVisitTable.game_id, gameTable.id))
    .innerJoin(userTable, eq(gameTable.creator_id, userTable.id))
    .where(eq(gameVisitTable.user_id, userId))
    .orderBy(desc(gameVisitTable.visited_at))
    .limit(limit);

  return visits;
}

export async function getGameVisitsByGameId(
  db: AppLoadContext["db"],
  gameId: number,
  { limit = 10 }: { limit?: number } = {}
) {
  const visits = await db
    .select({
      id: gameVisitTable.id,
      visited_at: gameVisitTable.visited_at,
      user: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(gameVisitTable)
    .innerJoin(userTable, eq(gameVisitTable.user_id, userTable.id))
    .where(eq(gameVisitTable.game_id, gameId))
    .orderBy(desc(gameVisitTable.visited_at))
    .limit(limit);

  return visits;
}

export async function getFriendsRecentGameVisits(
  db: AppLoadContext["db"],
  userId: number,
  { limit = 5 }: { limit?: number } = {}
) {
  // First get all friend IDs
  const friendships = await db
    .select({
      friend_id: friendshipTable.friend_id,
    })
    .from(friendshipTable)
    .where(eq(friendshipTable.user_id, userId));

  const friendIds = friendships.map((f) => f.friend_id);
  if (friendIds.length === 0) return [];

  // Then get recent visits from all friends
  const visits = await db
    .select({
      id: gameVisitTable.id,
      visited_at: gameVisitTable.visited_at,
      game: {
        id: gameTable.id,
        name: gameTable.name,
      },
      user: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(gameVisitTable)
    .innerJoin(gameTable, eq(gameVisitTable.game_id, gameTable.id))
    .innerJoin(userTable, eq(gameVisitTable.user_id, userTable.id))
    .where(inArray(gameVisitTable.user_id, friendIds))
    .orderBy(desc(gameVisitTable.visited_at))
    .limit(limit);

  return visits;
}
