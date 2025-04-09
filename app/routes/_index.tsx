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
import {
  getFriends,
  getPendingReceivedRequests,
  getPendingSentRequests,
} from "~/crud/friends.server";
import { getFriendsRecentGameVisits } from "~/crud/game-visit.server";
import { getGames, getGamesByUserId } from "~/crud/game.server";
import { updateLastSeen } from "~/crud/user.server";
import { useUser } from "~/hooks/loaders";
import { getUserId } from "~/lib/session.server";
import { friendsSchema } from "~/routes/sse";
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
    return {
      games: [],
      allGames,
      search,
      friends: [],
      pendingReceived: [],
      pendingSent: [],
      friendVisits: [],
    };
  }

  await updateLastSeen(context.db, userId);

  const [games, allGames, friends, pendingReceived, pendingSent, friendVisits] =
    await Promise.all([
      getGamesByUserId(context.db, userId),
      getGames(context.db, search),
      getFriends(context.db, userId),
      getPendingReceivedRequests(context.db, userId),
      getPendingSentRequests(context.db, userId),
      getFriendsRecentGameVisits(context.db, userId),
    ]);

  return {
    games,
    allGames,
    search,
    friends,
    pendingReceived,
    pendingSent,
    friendVisits,
  };
}

export default function Home() {
  const user = useUser();
  const {
    games,
    allGames,
    search,
    friends,
    pendingReceived,
    pendingSent,
    friendVisits,
  } = useLoaderData<typeof loader>();
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
      <AppSidebar
        games={games}
        initialFriends={friendsSchema.parse({
          friends,
          pendingReceived,
          pendingSent,
        })}
      />
      <SidebarInset>
        <div className="p-4 space-y-6">
          <div className="flex items-center gap-4">
            {searchParams.has("q") && (
              <Button variant="ghost" size="icon" onClick={clearSearch}>
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {user && friendVisits.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Recently played by friends
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                {friendVisits.map((visit) => (
                  <Link
                    key={visit.id}
                    to={`/game/${visit.game.id}`}
                    className="flex-none w-64 no-underline"
                  >
                    <Card className="hover:shadow-md transition-all duration-200 ease-in-out hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-base">
                          {visit.game.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Played by {visit.user.name}{" "}
                          {formatDistanceToNow(new Date(visit.visited_at))} ago
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
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
                        <span className="font-semibold">
                          {game.creator.name}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Created{" "}
                          {formatDistanceToNow(new Date(game.created_at))} ago
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
        </div>
      </SidebarInset>
    </SidebarLayout>
  );
}
