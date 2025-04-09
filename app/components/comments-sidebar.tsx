import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { href, useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { getCommentsByGameId } from "~/crud/comment.server";
import type { Game } from "~/database/schema";
import { useUser } from "~/hooks/loaders";

export function CommentsSidebar({
  comments: initialComments,
  game,
}: {
  comments: Awaited<ReturnType<typeof getCommentsByGameId>>;
  game: Game;
}) {
  const user = useUser();
  const commentFetcher = useFetcher({ key: "game-comment" });
  const [comments, setComments] = useState(initialComments);
  const formRef = useRef<HTMLFormElement>(null);

  // Update comments when the fetcher returns new data
  useEffect(() => {
    if (commentFetcher.data?.comment) {
      setComments((prev) => [commentFetcher.data.comment, ...prev]);
      formRef.current?.reset();
    }
  }, [commentFetcher.data]);

  // Sort comments by creation date, most recent first
  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      {user && (
        <div className="sticky top-0 z-50 bg-sidebar border-b shadow-sm">
          <commentFetcher.Form
            ref={formRef}
            method="post"
            action={href("/game/:id/comment", { id: String(game.id) })}
            className="p-2"
          >
            <div className="flex gap-2">
              <Input
                id="content"
                name="content"
                placeholder="Write a comment..."
                required
                className="flex-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={commentFetcher.state === "submitting"}
                className="shrink-0"
              >
                <SendIcon className="size-4" />
                <span className="sr-only">Send comment</span>
              </Button>
            </div>
          </commentFetcher.Form>
        </div>
      )}
      <ScrollArea>
        <ul className="p-2 flex flex-col gap-2">
          {sortedComments.map((comment) => (
            <li
              key={comment.id}
              className="border rounded-md p-2 flex flex-col gap-1.5"
            >
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  {comment.user?.name ?? "Unknown User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-sm">{comment.content}</p>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </>
  );
}
