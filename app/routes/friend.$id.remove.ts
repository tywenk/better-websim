import type { Route } from "./+types/friend.$id.remove";

import { removeFriendship } from "~/crud/friends.server";
import { authorize } from "~/lib/session.server";

export async function action({ context, params, request }: Route.ActionArgs) {
  const userId = await authorize(request);
  const friendId = Number(params.id);

  if (isNaN(friendId)) {
    return new Response(JSON.stringify({ error: "Invalid friend ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await removeFriendship(context.db, userId, friendId);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error removing friend:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to remove friend",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
