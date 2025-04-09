import { Outlet, redirect } from "react-router";
import { CommentsSidebar } from "~/components/comments-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { SidebarInset } from "~/components/ui/sidebar";
import { getCommentsByGameId } from "~/crud/comment.server";
import { getGame } from "~/crud/game.server";
import { useUser } from "~/hooks/loaders";
import type { Route } from "./+types/game.$id";

export async function loader({ context, request, params }: Route.LoaderArgs) {
  const gameId = Number(params.id);
  if (isNaN(gameId)) return redirect("/");

  const game = await getGame(context.db, gameId);
  if (!game) return redirect("/");

  const comments = await getCommentsByGameId(context.db, gameId);
  return { game, comments };
}

export default function Game({ loaderData }: Route.ComponentProps) {
  const user = useUser();
  const { game, comments } = loaderData;
  return (
    <SidebarLayout>
      {user ? (
        <CommentsSidebar comments={comments ?? []} gameId={game.id} />
      ) : null}
      <SidebarInset className="p-4">
        <Outlet />
      </SidebarInset>
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
