import { z } from "zod";
import { getFriends } from "~/crud/friends.server";
import type { User } from "~/database/schema";
import { EventStream } from "~/lib/eventstream.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/sse";

export const FRIENDS_CHANNEL = "friends";

// This matches the User type from schema.ts (Omit<typeof userTable.$inferSelect, "password_hash">)
const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
}) satisfies z.ZodType<User>;

export const friendsSchema = z.array(
  z.object({
    id: z.number(),
    friend: userSchema,
    created_at: z.string(),
  })
);

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await authorize(request);

  return new EventStream(request, async (send) => {
    const sendUpdate = async () => {
      const friends = await getFriends(context.db, userId);
      send(JSON.stringify(friends), {
        channel: FRIENDS_CHANNEL,
      });
    };

    // Send initial update
    await sendUpdate();

    // Set up interval for subsequent updates
    const update = setInterval(sendUpdate, 1000);

    return async () => {
      clearInterval(update);
    };
  });
}
