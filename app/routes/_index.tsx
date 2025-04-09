import { formatDistanceToNow } from "date-fns";
import { XIcon } from "lucide-react";
import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarLayout } from "~/components/sidebar-layout";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SidebarInset } from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { getGames, getGamesByUserId } from "~/crud/game.server";
import { useUser } from "~/hooks/loaders";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/_index";

// Helper function to highlight search terms
function HighlightText({
  text,
  searchTerm,
}: {
  text: string;
  searchTerm?: string;
}) {
  if (!searchTerm) return <>{text}</>;

  const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === searchTerm?.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

// Loading card skeleton component
function GameCardSkeleton() {
  return (
    <Card className="hover:shadow-md">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </CardContent>
    </Card>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Better Websim" },
    { name: "description", content: "Welcome to Better Websim" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  const url = new URL(request.url);
  const search = url.searchParams.get("q") || undefined;

  if (!userId) {
    const allGames = await getGames(context.db, search);
    return { games: [], allGames, search };
  }

  const [games, allGames] = await Promise.all([
    getGamesByUserId(context.db, userId),
    getGames(context.db, search),
  ]);

  return { games, allGames, search };
}

export default function Home() {
  const user = useUser();
  const { games, allGames, search } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = navigation.state === "loading" && searchParams.has("q");

  const clearSearch = () => {
    searchParams.delete("q");
    setSearchParams(searchParams);
  };

  const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <GameCardSkeleton key={i} />
        ))}
    </div>
  );

  const NoResults = () => (
    <div className="text-center py-8">
      <p className="text-lg text-muted-foreground">
        No games found {search ? `for "${search}"` : ""}
      </p>
    </div>
  );

  return (
    <SidebarLayout>
      {user ? <AppSidebar games={games ?? []} /> : null}
      <SidebarInset className="p-4">
        {search && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 z-10">
            <div className="bg-accent/80 backdrop-blur supports-[backdrop-filter]:bg-accent/60 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
              <span className="text-sm">
                Search results for "
                <span className="font-medium">{search}</span>"
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={clearSearch}
              >
                <XIcon className="h-3 w-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            </div>
          </div>
        )}
        {isSearching ? (
          <LoadingState />
        ) : allGames?.length === 0 ? (
          <NoResults />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allGames?.map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="no-underline"
              >
                <Card className="hover:shadow-md transition-all duration-200 ease-in-out hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
                  <CardHeader>
                    <CardTitle>
                      <HighlightText text={game.name} searchTerm={search} />
                    </CardTitle>
                    <CardDescription>
                      By{" "}
                      <span className="font-semibold">{game.creator.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(game.created_at))}{" "}
                        ago
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {game.play_count}{" "}
                        {game.play_count === 1 ? "view" : "views"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </SidebarInset>
    </SidebarLayout>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
