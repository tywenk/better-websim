import { redirect } from "react-router";
import { logout } from "~/lib/session.server";
import type { Route } from "./+types/_auth.logout";

export async function action({ request, context }: Route.ActionArgs) {
  return logout(request, context.cloudflare.env);
}

export async function loader() {
  return redirect("/login");
}
