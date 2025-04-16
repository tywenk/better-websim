import { useEffect, useState } from "react";
import {
  href,
  Outlet,
  redirect,
  useFetcher,
  useLoaderData,
} from "react-router";
import { CommentsSidebar } from "~/components/comments-sidebar";
import { EditableText } from "~/components/editable-text";
import { IterationsSidebar } from "~/components/iterations-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
} from "~/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { getCommentsByGameId } from "~/crud/comment.server";
import { createGameVisit } from "~/crud/game-visit.server";
import {
  getGameIterationsByGameId,
  incrementGamePlayCount,
} from "~/crud/game.server";
import { getUserId } from "~/lib/session.server";
import type { Handle } from "~/lib/utils";
import type { Route } from "./+types/game.$id";

export const handle: Handle<Awaited<ReturnType<typeof loader>>> = {
  breadcrumb: (match) => {
    return <h2 className="text-md font-semibold">{match.data.game.name}</h2>;
  },
};
export async function loader({ context, request, params }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  const gameId = Number(params.id);
  if (isNaN(gameId)) throw redirect("/");

  const game = await incrementGamePlayCount(context.db, gameId);
  if (!game) throw redirect("/");

  // Record game visit if user is logged in
  if (userId) {
    await createGameVisit(context.db, userId, gameId);
  }

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
          <Tabs defaultValue="iterations">
            <div className="p-2">
              <TabsList className="w-full">
                <TabsTrigger value="iterations" className="flex gap-2">
                  Versions
                  <Badge variant="secondary" className="ml-1">
                    {iterations.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex gap-2">
                  Comments
                  <Badge variant="secondary" className="ml-1">
                    {comments.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="comments">
              <CommentsSidebar comments={comments} game={game} />
            </TabsContent>
            <TabsContent value="iterations">
              <IterationsSidebar
                iterations={iterations}
                game={game}
                isOwner={isOwner}
              />
            </TabsContent>
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
