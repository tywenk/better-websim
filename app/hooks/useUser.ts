import { useLoaderData } from "react-router";
import type { loader } from "~/routes/_index";

export function useUser() {
  const data = useLoaderData<typeof loader>();
  return data?.user;
}
