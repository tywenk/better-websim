import { Outlet, useLoaderData } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { SidebarInset } from "~/components/ui/sidebar";
import { getGamesByUserId } from "~/crud/game.server";
import { useUser } from "~/hooks/loaders";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Better Websim" },
    { name: "description", content: "Welcome to Better Websim" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return { games: [] };

  const games = await getGamesByUserId(context.db, userId);
  return { games };
}

export default function Home() {
  const user = useUser();
  const { games } = useLoaderData<typeof loader>();
  return (
    <SidebarLayout>
      {user ? <AppSidebar games={games ?? []} /> : null}
      <SidebarInset className="p-4">
        <Outlet />
      </SidebarInset>
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
