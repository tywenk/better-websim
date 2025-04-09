import { z } from "zod";
import { sendFriendRequest } from "~/crud/friends.server";
import { getUserByEmail } from "~/crud/user.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/friend.add";

const addFriendSchema = z.object({
  email: z.string().email(),
});

export async function action({ request, context }: Route.ActionArgs) {
  const userId = await authorize(request);

  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();

    const result = addFriendSchema.safeParse({ email });
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find the user by email
    const targetUser = await getUserByEmail(context.db, result.data.email);
    if (!targetUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Can't add yourself
    if (targetUser.id === userId) {
      return new Response(
        JSON.stringify({ error: "You cannot add yourself as a friend" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send friend request
    await sendFriendRequest(context.db, userId, targetUser.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Friend request already sent" ||
        error.message === "Already friends with this user")
    ) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "An error occurred while sending friend request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
