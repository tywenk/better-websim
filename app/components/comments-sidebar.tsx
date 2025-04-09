import * as React from "react";

import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "~/components/ui/sidebar";
import type { Comment } from "~/database/schema";
import { useUser } from "~/hooks/loaders";

export function CommentsSidebar({
  comments,
  ...props
}: React.ComponentProps<typeof Sidebar> & { comments: Comment[] }) {
  const user = useUser();
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <h2 className="text-lg font-bold">Comments</h2>
      </SidebarHeader>
      <SidebarContent>
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold">{comment.content}</h3>
                </div>
              </div>
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
