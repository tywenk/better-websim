import { formatDistanceToNow } from "date-fns";
import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { AppSidebar } from "~/components/app-sidebar";
import { SearchForm } from "~/components/search-form";
import { SidebarLayout } from "~/components/sidebar-layout";
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
    { title: "Mob Vibe Coding" },
    { name: "description", content: "Welcome to Mob Vibe Coding" },
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
      {user ? (
        <AppSidebar
          games={games}
          initialFriends={friendsSchema.parse({
            friends,
            pendingReceived,
            pendingSent,
          })}
        />
      ) : null}
      <SidebarInset>
        <div className="p-4 space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recently played by friends
          </h2>

          {user && friendVisits.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-10">
              {friendVisits.map((visit) => (
                <Link
                  key={visit.game.id}
                  to={`/game/${visit.game.id}`}
                  className="no-underline"
                >
                  <Card className="hover:shadow-md transition-all duration-200 ease-in-out hover:border-primary/50 hover:bg-accent/50 cursor-pointer">
                    <CardHeader>
                      <CardTitle>
                        <HighlightText
                          text={visit.game.name}
                          searchTerm={search}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Played by {visit.user.name}{" "}
                          {formatDistanceToNow(new Date(visit.visited_at))} ago
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <h2 className="text-sm font-medium text-muted-foreground">
            Explore all games
          </h2>
          <SearchForm className="" />
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
