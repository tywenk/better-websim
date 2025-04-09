import { redirect } from "react-router";
import { createGame } from "~/crud/game.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/game.new";

export async function action({ context, request }: Route.ActionArgs) {
  const userId = await authorize(request);
  const name = "Untitled Game";
  const game = await createGame(context.db, { name, creator_id: userId });
  return redirect(`/game/${game.id}`);
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
