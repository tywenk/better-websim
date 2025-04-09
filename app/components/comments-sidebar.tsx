import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { href, useFetcher } from "react-router";
import { EditableText } from "~/components/EditableText";

import { NavUser } from "~/components/nav-user";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
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
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  comments: Awaited<ReturnType<typeof getCommentsByGameId>>;
  game: Game;
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
      setComments((prev) => [...prev, commentFetcher.data.comment]);
      formRef.current?.reset();
    }
  }, [commentFetcher.data]);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <EditableText
          value={optimisticName}
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
      <Separator className="mb-4" />
      <SidebarContent>
        {user && (
          <commentFetcher.Form
            ref={formRef}
            method="post"
            action={href("/game/:id/comment", { id: String(game.id) })}
            className="mb-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Add a comment</Label>
              <Input
                id="content"
                name="content"
                placeholder="Write your comment..."
                required
              />
              <Button
                type="submit"
                className="w-full"
                disabled={commentFetcher.state === "submitting"}
              >
                {commentFetcher.state === "submitting"
                  ? "Posting..."
                  : "Post Comment"}
              </Button>
            </div>
          </commentFetcher.Form>
        )}
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border rounded-md p-3 space-y-2">
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
