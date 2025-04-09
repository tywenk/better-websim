import { type ActionFunctionArgs } from "react-router";
import { createGameIteration } from "~/crud/game.server";
import { authorize } from "~/lib/session.server";

export async function action({ context, request, params }: ActionFunctionArgs) {
  // Only allow logged in users to create iterations
  const userId = await authorize(request);
  const formData = await request.formData();
  const content = formData.get("content")?.toString();
  const gameId = Number(params.id);

  if (!content || !gameId || isNaN(gameId)) {
    return new Response(JSON.stringify({ error: "Invalid iteration data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const newIteration = await createGameIteration(context.db, {
    content,
    game_id: gameId,
  });

  return { iteration: newIteration };
}
