import { SendIcon } from "lucide-react";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { href, useFetcher } from "react-router";
import { EditableText } from "~/components/EditableText";

import { NavUser } from "~/components/nav-user";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import type { getCommentsByGameId } from "~/crud/comment.server";
import type { Game } from "~/database/schema";
import { useUser } from "~/hooks/loaders";

export function CommentsSidebar({
  comments: initialComments,
  game,
  isOwner,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  comments: Awaited<ReturnType<typeof getCommentsByGameId>>;
  game: Game;
  isOwner: boolean;
}) {
  const user = useUser();
  const commentFetcher = useFetcher({ key: "comment" });
  const [comments, setComments] = useState(initialComments);
  const formRef = useRef<HTMLFormElement>(null);

  const nameFetcher = useFetcher({ key: "name" });
  const [optimisticName, setOptimisticName] = React.useState(game.name);

  // Update optimistic name when game prop changes
  useEffect(() => {
    setOptimisticName(game.name);
  }, [game.name]);

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
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! divide-y"
      {...props}
    >
      <SidebarHeader>
        <EditableText
          value={optimisticName}
          isEditable={isOwner}
          onSubmit={(name) => {
            setOptimisticName(name);
            nameFetcher.submit(
              { name },
              {
                method: "post",
                action: href("/game/:id/update", { id: String(game.id) }),
              }
            );
          }}
        />
      </SidebarHeader>
      <SidebarContent>
        {user && (
          <div className="sticky top-0 z-10 bg-sidebar border-b">
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
        <div className="overflow-y-auto">
          <div className="p-2">
            <ul className="flex flex-col gap-2">
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
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-2">
        {user ? <NavUser user={user} /> : <NavLogin />}
      </SidebarFooter>
    </Sidebar>
  );
}

function NavLogin() {
  return <div>Login</div>;
}
