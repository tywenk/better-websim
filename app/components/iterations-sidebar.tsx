import { CopyIcon, EyeIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Textarea } from "~/components/ui/textarea";
import type { getGameIterationsByGameId } from "~/crud/game.server";
import type { Game } from "~/database/schema";

export function IterationsSidebar({
  iterations: initialIterations,
  game,
  isOwner,
}: {
  iterations: Awaited<ReturnType<typeof getGameIterationsByGameId>>;
  game: Game;
  isOwner: boolean;
}) {
  const iterationFetcher = useFetcher({ key: "iteration" });
  const [iterations, setIterations] = useState(initialIterations);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();

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
      {isOwner && (
        <div className="sticky top-0 z-10 bg-sidebar border-b">
          <iterationFetcher.Form
            ref={formRef}
            method="post"
            action={`/game/${game.id}/iteration`}
            className="p-2"
          >
            <div className="flex flex-col gap-2">
              <Textarea
                id="content"
                name="content"
                placeholder="Add iteration content..."
                required
                className="min-h-[100px] resize-none max-h-[200px]"
              />
              <Button
                type="submit"
                disabled={iterationFetcher.state === "submitting"}
                className="w-full"
              >
                {iterationFetcher.state === "submitting" ? (
                  "Adding..."
                ) : (
                  <>
                    <SendIcon className="size-4 mr-2" />
                    Add Iteration
                  </>
                )}
              </Button>
            </div>
          </iterationFetcher.Form>
        </div>
      )}
      <ScrollArea className="max-w-full [&_[data-radix-scroll-area-viewport]>div]:!block">
        <ul className="p-2 flex flex-col gap-2 w-full">
          {sortedIterations.map((iteration) => (
            <li
              key={iteration.id}
              className="border rounded-md p-2 flex flex-1 flex-col gap-1.5 cursor-pointer w-full overflow-hidden hover:shadow-md transition-all duration-200 ease-in-out hover:border-primary/50 hover:bg-accent/50"
              onClick={() => {
                navigate(`?v=${iteration.id}`);
              }}
            >
              <div className="flex justify-between items-center w-full">
                <p className="text-xs text-muted-foreground">
                  {new Date(iteration.created_at).toLocaleString()}
                </p>
              </div>
              <pre className="line-clamp-3 font-mono text-xs whitespace-pre-wrap break-words w-full">
                {iteration.content}
              </pre>
              <div className="flex items-center justify-between pt-1.5 border-t mt-1">
                <span className="text-xs text-muted-foreground">
                  {iteration.content.split("\n").length} lines
                </span>
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-6"
                    onClick={() => {
                      navigator.clipboard.writeText(iteration.content);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <CopyIcon className="size-3" />
                    <span className="sr-only">Copy content</span>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="size-6">
                        <EyeIcon className="size-3" />
                        <span className="sr-only">View full content</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Iteration Content</DialogTitle>
                        <div className="text-xs text-muted-foreground">
                          {new Date(iteration.created_at).toLocaleString()}
                        </div>
                      </DialogHeader>
                      <ScrollArea className="max-h-[60vh]">
                        <pre className="whitespace-pre-wrap break-words font-mono text-sm p-4">
                          {iteration.content}
                        </pre>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
}
