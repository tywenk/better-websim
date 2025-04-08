import { eventStream } from "remix-utils/sse/server";
import { interval } from "remix-utils/timers";
import type { Route } from "./+types/sse.friends";

export async function loader({ request }: Route.LoaderArgs) {
  return eventStream(request.signal, (send) => {
    let isRunning = true;

    async function run() {
      for await (let _ of interval(1000, { signal: request.signal })) {
        if (!isRunning) break;
        send({ event: "time", data: new Date().toISOString() });
      }
    }

    run();

    return () => {
      isRunning = false;
    };
  });
}
