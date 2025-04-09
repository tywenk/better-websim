import { z } from "zod";
import {
  acceptFriendRequest,
  rejectFriendRequest,
} from "~/crud/friends.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/friend.$id";

const actionSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type ActionData = z.infer<typeof actionSchema>;

export async function action({ request, context, params }: Route.ActionArgs) {
  const userId = await authorize(request);
  const requestId = parseInt(params.id, 10);

  if (isNaN(requestId)) {
    return new Response(JSON.stringify({ error: "Invalid request ID" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const action = formData.get("action")?.toString();

  const result = actionSchema.safeParse({ action });
  if (!result.success) {
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    if (result.data.action === "accept") {
      await acceptFriendRequest(context.db, requestId, userId);
      return new Response(
        JSON.stringify({ success: true, action: "accepted" })
      );
    } else {
      await rejectFriendRequest(context.db, requestId, userId);
      return new Response(
        JSON.stringify({ success: true, action: "rejected" })
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      { status: 500 }
    );
  }
}
