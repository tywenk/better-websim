import { useEffect, useState } from "react";
import {
  href,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import { CommentsSidebar } from "~/components/comments-sidebar";
import { EditableText } from "~/components/EditableText";
import { IterationsSidebar } from "~/components/iterations-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "~/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getCommentsByGameId } from "~/crud/comment.server";
import {
  getGameIterationsByGameId,
  incrementGamePlayCount,
} from "~/crud/game.server";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/game.$id";

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  const gameId = Number(params.id);
  if (isNaN(gameId)) return redirect("/");

  const game = await incrementGamePlayCount(context.db, gameId);
  if (!game) return redirect("/");

  const [comments, iterations] = await Promise.all([
    getCommentsByGameId(context.db, gameId),
    getGameIterationsByGameId(context.db, gameId),
  ]);

  return { game, comments, iterations, isOwner: game.creator_id === userId };
}

export default function GamePage() {
  const { game, comments, iterations, isOwner } =
    useLoaderData<typeof loader>();

  const nameFetcher = useFetcher({ key: "game-name-update" });
  const [optimisticName, setOptimisticName] = useState(game.name);

  // Update optimistic name when game prop changes
  useEffect(() => {
    setOptimisticName(game.name);
  }, [game.name]);
  return (
    <SidebarLayout>
      <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]! divide-y">
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
          <Tabs defaultValue="comments">
            <div className="p-2">
              <TabsList className="w-full">
                <TabsTrigger value="comments">
                  Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger
                  disabled={!isOwner}
                  value="iterations"
                  className="flex-1"
                >
                  Iterations ({iterations.length})
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="comments">
              <CommentsSidebar comments={comments} game={game} />
            </TabsContent>
            {isOwner && (
              <TabsContent value="iterations">
                <IterationsSidebar iterations={iterations} game={game} />
              </TabsContent>
            )}
          </Tabs>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
