import { Outlet } from "react-router";
import { SidebarLayout } from "~/components/sidebar-layout";
import { getGamesByUserId } from "~/crud/game.server";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/game";

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return { games: [] };

  const games = await getGamesByUserId(context.db, userId);
  return { games };
}
export default function Game({ loaderData }: Route.ComponentProps) {
  const { games } = loaderData;
  return (
    <SidebarLayout games={games}>
      <Outlet />
    </SidebarLayout>
  );
}
