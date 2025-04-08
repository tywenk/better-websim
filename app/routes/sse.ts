import { z } from "zod";
import { EventStream } from "~/lib/eventstream.server";
import type { Route } from "./+types/sse";

export const FRIENDS_CHANNEL = "friends";

export const friendsSchema = z.object({
  online: z.number(),
  offline: z.number(),
});

export async function loader({ request }: Route.LoaderArgs) {
  return new EventStream(request, (send) => {
    let update = setInterval(() => {
      const data = {
        online: Math.floor(Math.random() * 100),
        offline: Math.floor(Math.random() * 100),
      } satisfies z.infer<typeof friendsSchema>;

      send(JSON.stringify(data), {
        channel: FRIENDS_CHANNEL,
      });
    }, 1000);

    return async () => {
      clearInterval(update);
    };
  });
}
