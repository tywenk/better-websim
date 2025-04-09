import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { useFriends } from "~/hooks/use-friends";

export function NavFriends() {
  const friends = useFriends();

  if (!friends) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Friends ({friends.length})</SidebarGroupLabel>
      <SidebarMenu>
        {friends.map((friendship) => (
          <SidebarMenuItem key={friendship.id}>
            <SidebarMenuButton>
              <Avatar className="h-6 w-6 rounded-lg">
                <AvatarFallback className="rounded-lg text-xs">
                  {friendship.friend.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{friendship.friend.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {friends.length === 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Users className="text-muted-foreground" />
              <span className="text-muted-foreground">No friends yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
