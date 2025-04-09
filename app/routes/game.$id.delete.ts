import { redirect } from "react-router";
import { deleteGame, getGame } from "~/crud/game.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/game.$id.delete";

export async function action({ context, request, params }: Route.ActionArgs) {
  // Only allow logged in users to delete games
  const userId = await authorize(request);
  const gameId = Number(params.id);

  if (!gameId || isNaN(gameId)) {
    return new Response(JSON.stringify({ error: "Invalid game ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the game to check if the user is the creator
  const game = await getGame(context.db, gameId);

  if (!game) {
    return new Response(JSON.stringify({ error: "Game not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check if the user is the creator
  if (game.creator_id !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Delete the game
  await deleteGame(context.db, gameId);
  return redirect("/");
}
