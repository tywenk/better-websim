import { redirect } from "react-router";
import { getGame } from "~/crud/game.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/game.$id";

export async function loader({ context, params }: Route.LoaderArgs) {
  const gameId = Number(params.id);
  if (isNaN(gameId)) return redirect("/");

  const game = await getGame(context.db, gameId);
  if (!game) return redirect("/");

  console.log(game);

  return { game };
}

export async function action({ context, request }: Route.ActionArgs) {
  const userId = await authorize(request);
}

export default function Game({ loaderData }: Route.ComponentProps) {
  const { game } = loaderData;
  return (
    <div>
      <h1 className="text-2xl font-bold">{game.name}</h1>
      <p className="text-sm text-gray-500">{game.id}</p>
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
