import { formatDistanceToNow } from "date-fns";
import { Link, useLoaderData } from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SidebarInset } from "~/components/ui/sidebar";
import { getGames, getGamesByUserId } from "~/crud/game.server";
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
  const allGames = await getGames(context.db);

  return { games, allGames };
}

export default function Home() {
  const user = useUser();
  const { games, allGames } = useLoaderData<typeof loader>();
  return (
    <SidebarLayout>
      {user ? <AppSidebar games={games ?? []} /> : null}
      <SidebarInset className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allGames?.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="no-underline"
            >
              <Card className="hover:shadow-md transition-all duration-200 ease-in-out hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
                <CardHeader>
                  <CardTitle>{game.name}</CardTitle>
                  <CardDescription>
                    By{" "}
                    <span className="font-semibold">{game.creator.name}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {formatDistanceToNow(new Date(game.created_at))} ago
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SidebarInset>
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
