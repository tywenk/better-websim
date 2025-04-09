import { createComment, getCommentWithUser } from "~/crud/comment.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/game.$id.comment";

export async function action({ context, request, params }: Route.ActionArgs) {
  // Only allow logged in users to create comments
  const userId = await authorize(request);
  const formData = await request.formData();
  const content = formData.get("content")?.toString();
  const gameId = Number(params.id);

  if (!content || !gameId || isNaN(gameId)) {
    return new Response(JSON.stringify({ error: "Invalid comment data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const newComment = await createComment(context.db, {
    content,
    game_id: gameId,
    user_id: userId,
  });

  // Get the comment with user data
  const comment = await getCommentWithUser(context.db, newComment.id);
  return { comment };
}
