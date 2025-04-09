import * as React from "react";
import { href, useFetcher } from "react-router";

import { NavUser } from "~/components/nav-user";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import type { getCommentsByGameId } from "~/crud/comment.server";
import { useUser } from "~/hooks/loaders";

export function CommentsSidebar({
  comments: initialComments,
  gameId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  comments: Awaited<ReturnType<typeof getCommentsByGameId>>;
  gameId: number;
}) {
  const user = useUser();
  const fetcher = useFetcher();
  const [comments, setComments] = React.useState(initialComments);
  const formRef = React.useRef<HTMLFormElement>(null);

  // Update comments when the fetcher returns new data
  React.useEffect(() => {
    if (fetcher.data?.comment) {
      setComments((prev) => [...prev, fetcher.data.comment]);
      formRef.current?.reset();
    }
  }, [fetcher.data]);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <h2 className="text-lg font-bold">Comments</h2>
      </SidebarHeader>
      <SidebarContent>
        {user && (
          <fetcher.Form
            ref={formRef}
            method="post"
            action={href("/game/:id/comment", { id: String(gameId) })}
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
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </fetcher.Form>
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
