import { redirect } from "react-router";
import type { Route } from "./+types/game";

export async function loader({ params }: Route.LoaderArgs) {
  // if params is an empty object redirect to /
  if (Object.keys(params).length === 0) return redirect("/");

  return null;
}
