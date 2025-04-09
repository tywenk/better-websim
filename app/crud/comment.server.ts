import { and, eq } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import { commentTable, type CreateComment } from "~/database/schema";

export async function createComment(
  db: AppLoadContext["db"],
  comment: CreateComment
) {
  const [newComment] = await db
    .insert(commentTable)
    .values(comment)
    .returning();
  return newComment;
}

export async function getCommentsByGameId(
  db: AppLoadContext["db"],
  gameId: number
) {
  return db
    .select()
    .from(commentTable)
    .where(eq(commentTable.game_id, gameId))
    .orderBy(commentTable.created_at);
}

export async function updateComment(
  db: AppLoadContext["db"],
  id: number,
  userId: number,
  content: string
) {
  const [updatedComment] = await db
    .update(commentTable)
    .set({ content, updated_at: new Date().toISOString() })
    .where(and(eq(commentTable.id, id), eq(commentTable.user_id, userId)))
    .returning();
  return updatedComment;
}

export async function deleteComment(
  db: AppLoadContext["db"],
  id: number,
  userId: number
) {
  const [deletedComment] = await db
    .delete(commentTable)
    .where(and(eq(commentTable.id, id), eq(commentTable.user_id, userId)))
    .returning();
  return deletedComment;
}
