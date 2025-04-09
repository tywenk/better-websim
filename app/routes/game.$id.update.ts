import { type ActionFunctionArgs } from "react-router";
import { getGame, updateGame } from "~/crud/game.server";
import { authorize } from "~/lib/session.server";

export async function action({ context, request, params }: ActionFunctionArgs) {
  // Only allow logged in users to update games
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

  const formData = await request.formData();
  const name = formData.get("name")?.toString();

  if (!name) {
    return new Response(JSON.stringify({ error: "Name is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Update the game name
  const updatedGame = await updateGame(context.db, gameId, { name });
  return { game: updatedGame };
}
