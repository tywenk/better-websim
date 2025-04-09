import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import type { Game } from "~/database/schema";
import { useUser } from "~/hooks/loaders";

export function SidebarLayout({
  games,
  children,
}: {
  games: Game[];
  children: React.ReactNode;
}) {
  const user = useUser();
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader user={user} />
        <div className="flex flex-1">
          {user ? <AppSidebar games={games ?? []} /> : null}
          <SidebarInset className="p-4">{children}</SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
