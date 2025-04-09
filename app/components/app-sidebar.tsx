import { PlusIcon } from "lucide-react";
import * as React from "react";
import { Form, href } from "react-router";

import { NavGames } from "~/components/nav-games";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import type { Game } from "~/database/schema";
import { useUser } from "~/hooks/loaders";

export function AppSidebar({
  games,
  ...props
}: React.ComponentProps<typeof Sidebar> & { games: Game[] }) {
  const user = useUser();
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Form method="post" action={href("/game/new")}>
              <SidebarMenuButton size="lg" asChild>
                <button type="submit">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <PlusIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">New game</span>
                  </div>
                </button>
              </SidebarMenuButton>
            </Form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGames games={games} />
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
