import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { getGameIterationsByGameId } from "~/crud/game.server";
import type { Game } from "~/database/schema";

export function IterationsSidebar({
  iterations: initialIterations,
  game,
}: {
  iterations: Awaited<ReturnType<typeof getGameIterationsByGameId>>;
  game: Game;
}) {
  const iterationFetcher = useFetcher({ key: "iteration" });
  const [iterations, setIterations] = useState(initialIterations);
  const formRef = useRef<HTMLFormElement>(null);

  // Update iterations when the fetcher returns new data
  useEffect(() => {
    if (iterationFetcher.data?.iteration) {
      setIterations((prev) => [iterationFetcher.data.iteration, ...prev]);
      formRef.current?.reset();
    }
  }, [iterationFetcher.data]);

  // Sort iterations by creation date, most recent first
  const sortedIterations = [...iterations].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      <div className="sticky top-0 z-10 bg-sidebar border-b">
        <iterationFetcher.Form
          ref={formRef}
          method="post"
          action={`/game/${game.id}/iteration`}
          className="p-2"
        >
          <div className="flex gap-2">
            <Input
              id="content"
              name="content"
              placeholder="Add iteration content..."
              required
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={iterationFetcher.state === "submitting"}
              className="shrink-0"
            >
              <SendIcon className="size-4" />
              <span className="sr-only">Add iteration</span>
            </Button>
          </div>
        </iterationFetcher.Form>
      </div>
      <ScrollArea>
        <ul className="p-2 flex flex-col gap-2">
          {sortedIterations.map((iteration) => (
            <li
              key={iteration.id}
              className="border rounded-md p-2 flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {new Date(iteration.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-sm">{iteration.content}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
}
