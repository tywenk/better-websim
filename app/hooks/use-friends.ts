import type { z } from "zod";
import { useEventStream } from "~/lib/eventstream";
import { friendsSchema } from "~/routes/sse";

export function useFriends(initialData?: z.infer<typeof friendsSchema>) {
  return useEventStream("/sse", {
    deserialize: (raw) => friendsSchema.parse(JSON.parse(raw)),
    channel: "friends",
    returnLatestOnly: true,
    initialData,
  });
}
