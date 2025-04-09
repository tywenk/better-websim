import { useEventStream } from "~/lib/eventstream";
import { friendsSchema } from "~/routes/sse";

export function useFriends() {
  return useEventStream("/sse", {
    deserialize: (raw) => friendsSchema.parse(JSON.parse(raw)),
    channel: "friends",
    returnLatestOnly: true,
  });
}
