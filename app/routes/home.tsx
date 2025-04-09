import { getGames } from "~/crud/game.server";
import type { Route } from "./+types/home";

export async function loader({ context }: Route.LoaderArgs) {
  const allGames = await getGames(context.db);
  return { allGames };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { allGames } = loaderData;

  return (
    <div className="grid grid-cols-3 gap-4">
      {allGames.map((game) => (
        <div key={game.id}>{game.name}</div>
      ))}
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
