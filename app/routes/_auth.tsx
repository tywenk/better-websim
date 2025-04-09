import { Outlet, redirect } from "react-router";
import { getUserId } from "~/lib/session.server";
import type { Route } from "./+types/_auth";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return null;
}

export default function Auth() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Outlet />
    </div>
  );
}
export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
