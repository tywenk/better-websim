import { and, eq } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import { commentTable, userTable, type CreateComment } from "~/database/schema";

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

export async function getCommentWithUser(
  db: AppLoadContext["db"],
  commentId: number
) {
  const [comment] = await db
    .select({
      id: commentTable.id,
      content: commentTable.content,
      game_id: commentTable.game_id,
      created_at: commentTable.created_at,
      updated_at: commentTable.updated_at,
      user: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(commentTable)
    .innerJoin(userTable, eq(commentTable.user_id, userTable.id))
    .where(eq(commentTable.id, commentId))
    .limit(1);

  return comment;
}

export async function getCommentsByGameId(
  db: AppLoadContext["db"],
  gameId: number
) {
  return db
    .select({
      id: commentTable.id,
      content: commentTable.content,
      game_id: commentTable.game_id,
      created_at: commentTable.created_at,
      updated_at: commentTable.updated_at,
      user: {
        id: userTable.id,
        name: userTable.name,
      },
    })
    .from(commentTable)
    .innerJoin(userTable, eq(commentTable.user_id, userTable.id))
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
