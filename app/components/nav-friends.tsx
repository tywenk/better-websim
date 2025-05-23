import { differenceInMinutes, formatDistanceToNow } from "date-fns";
import { Check, Clock, Trash2Icon, UserPlus, Users, X } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useFriends } from "~/hooks/use-friends";
import { cn } from "~/lib/utils";
import { friendsSchema } from "~/routes/sse";

type OnlineStatus = "online" | "away" | "offline";

interface StatusInfo {
  status: OnlineStatus;
  color: string;
}

/**
 * Get user's online status based on when they were last seen
 */
function getOnlineStatus(lastSeenAt: string): StatusInfo {
  const diffInMinutes = differenceInMinutes(new Date(), new Date(lastSeenAt));

  if (diffInMinutes <= 1) {
    return { status: "online", color: "bg-emerald-500" };
  }
  if (diffInMinutes <= 5) {
    return { status: "away", color: "bg-orange-500" };
  }
  return { status: "offline", color: "" };
}

export function NavFriends({
  initialFriends,
}: {
  initialFriends: z.infer<typeof friendsSchema>;
}) {
  const friendsData = useFriends(initialFriends);
  const [isOpen, setIsOpen] = useState(false);
  const addFriendFetcher = useFetcher();
  const actionFetcher = useFetcher();
  const removeFriendFetcher = useFetcher();

  if (!friendsData) {
    return null;
  }

  const data = friendsData as z.infer<typeof friendsSchema>;
  const { friends, pendingReceived, pendingSent } = data;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    addFriendFetcher.submit(formData, {
      method: "post",
      action: "/friend/add",
    });

    // Show success or error message
    addFriendFetcher.data?.error
      ? toast.error(addFriendFetcher.data.error)
      : toast.success("Friend request sent!");

    if (!addFriendFetcher.data?.error) {
      setIsOpen(false);
      form.reset();
    }
  };

  const handleFriendAction = (
    requestId: number,
    action: "accept" | "reject"
  ) => {
    const formData = new FormData();
    formData.append("action", action);

    actionFetcher.submit(formData, {
      method: "post",
      action: `/friend/${requestId}`,
    });

    // Show success or error message
    if (actionFetcher.data?.error) {
      toast.error(actionFetcher.data.error);
    } else if (actionFetcher.data?.action === "accepted") {
      toast.success("Friend request accepted!");
    } else if (actionFetcher.data?.action === "rejected") {
      toast.success("Friend request rejected");
    }
  };

  const handleRemoveFriend = (friendId: number, friendName: string) => {
    removeFriendFetcher.submit(
      {},
      {
        method: "post",
        action: `/friend/${friendId}/remove`,
      }
    );

    // Show success or error message
    if (removeFriendFetcher.data?.error) {
      toast.error(removeFriendFetcher.data.error);
    } else {
      toast.success(`Removed ${friendName} from friends`);
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <SidebarMenuButton variant="outline">
                <div className="bg-emerald-500/20 text-emerald-500 flex aspect-square size-6 items-center justify-center rounded-md">
                  <UserPlus className="size-4" />
                </div>
                <span className="text-emerald-500 font-medium">Add Friend</span>
              </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Friend</DialogTitle>
                <DialogDescription>
                  Send a friend request to another user by their email address.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="friend@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={addFriendFetcher.state === "submitting"}
                  >
                    Send Request
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </SidebarMenuItem>

        {/* Pending Received Requests */}
        {pendingReceived.length > 0 && (
          <>
            <SidebarMenuItem className="pt-2">
              <span className="text-xs font-medium text-muted-foreground px-2">
                Pending Requests ({pendingReceived.length})
              </span>
            </SidebarMenuItem>
            {pendingReceived.map((request) => (
              <SidebarMenuItem key={request.id}>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">
                      {request.sender.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start leading-none">
                    <span className="truncate">{request.sender.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Wants to be friends
                    </span>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={() => handleFriendAction(request.id, "accept")}
                      className="text-emerald-500 hover:text-emerald-600 rounded-full p-1 hover:bg-emerald-500/10"
                      disabled={actionFetcher.state === "submitting"}
                    >
                      <Check className="size-4" />
                      <span className="sr-only">Accept friend request</span>
                    </button>
                    <button
                      onClick={() => handleFriendAction(request.id, "reject")}
                      className="text-red-500 hover:text-red-600 rounded-full p-1 hover:bg-red-500/10"
                      disabled={actionFetcher.state === "submitting"}
                    >
                      <X className="size-4" />
                      <span className="sr-only">Reject friend request</span>
                    </button>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </>
        )}

        {/* Pending Sent Requests */}
        {pendingSent.length > 0 && (
          <>
            <SidebarMenuItem className="pt-2">
              <span className="text-xs font-medium text-muted-foreground px-2">
                Sent Requests ({pendingSent.length})
              </span>
            </SidebarMenuItem>
            {pendingSent.map((request) => (
              <SidebarMenuItem key={request.id}>
                <SidebarMenuButton>
                  <Avatar className="h-6 w-6 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs">
                      {request.receiver.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start leading-none">
                    <span className="truncate">{request.receiver.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Request sent
                    </span>
                  </div>
                  <Clock className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </>
        )}

        {/* Friends List */}
        {friends.length > 0 && (
          <>
            <SidebarMenuItem className="pt-2">
              <span className="text-xs font-medium text-muted-foreground px-2">
                Friends ({friends.length})
              </span>
            </SidebarMenuItem>
            {friends.map((friendship) => {
              const onlineStatus = getOnlineStatus(
                friendship.friend.last_seen_at
              );
              return (
                <SidebarMenuItem key={friendship.id}>
                  <SidebarMenuButton className="group relative">
                    <Avatar className="h-6 w-6 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs">
                        {friendship.friend.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{friendship.friend.name}</span>
                    {onlineStatus.color && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "size-2 rounded-full absolute left-7 top-1",
                                onlineStatus.color
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            Last seen{" "}
                            {formatDistanceToNow(
                              new Date(friendship.friend.last_seen_at)
                            )}{" "}
                            ago
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <div
                          role="button"
                          tabIndex={0}
                          className="absolute right-2 text-red-500 hover:text-red-600 rounded-full p-1 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.click();
                            }
                          }}
                        >
                          <Trash2Icon className="size-4" />
                          <span className="sr-only">Remove friend</span>
                        </div>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Remove Friend</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to remove{" "}
                            {friendship.friend.name} from your friends list?
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleRemoveFriend(
                                friendship.friend.id,
                                friendship.friend.name
                              )
                            }
                            disabled={
                              removeFriendFetcher.state === "submitting"
                            }
                          >
                            Remove Friend
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </>
        )}

        {/* Empty State */}
        {friends.length === 0 &&
          pendingReceived.length === 0 &&
          pendingSent.length === 0 && (
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
