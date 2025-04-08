import { redirect } from "react-router";
import { logout } from "~/lib/session.server";
import type { Route } from "./+types/_auth.logout";

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}

export async function loader() {
  return redirect("/login");
}
