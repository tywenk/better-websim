import { Form, Link } from "react-router";
import { getUserById } from "~/crud/user.server";
import { useEventStream } from "~/lib/eventstream";
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
  if (!userId) return null;

  const user = await getUserById(context.db, userId);
  if (!user) return new Response("User not found", { status: 400 });

  return user;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const test = useEventStream("/sse", {
    channel: "friends",
    maxEventRetention: 0,
  });

  return (
    <div>
      <p>{test}</p>
      {loaderData && <p>You are logged in as {loaderData.name}</p>}
      {loaderData == null && <Link to="/login">Login</Link>}
      {loaderData && (
        <Form method="post" action="/logout">
          <button type="submit">Logout</button>
        </Form>
      )}
    </div>
  );
}

export { DefaultErrorBoundary as ErrorBoundary } from "~/components/default-error-boundary";
