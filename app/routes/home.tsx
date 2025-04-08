import { Link, Outlet } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { getGamesByUserId } from "~/crud/game.server";
import { getUserById } from "~/crud/user.server";
import { useEventStream } from "~/lib/eventstream";
import { getUserId } from "~/lib/session.server";
import { friendsSchema } from "~/routes/sse";
import type { Route } from "./+types/home";

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) return null;

  const user = await getUserById(context.db, userId);
  if (!user) return new Response("User not found", { status: 400 });

  const games = await getGamesByUserId(context.db, userId);

  return { user, games };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const test = useEventStream("/sse", {
    deserialize: (raw) => friendsSchema.parse(JSON.parse(raw)),
    channel: "friends",
    returnLatestOnly: true,
  });

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar games={loaderData?.games ?? []} />
          <SidebarInset className="p-4">
            <p>Online: {test?.online}</p>
            <p>Offline: {test?.offline}</p>
            {loaderData && <p>You are logged in as {loaderData.user.name}</p>}
            {loaderData == null && <Link to="/login">Login</Link>}
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
