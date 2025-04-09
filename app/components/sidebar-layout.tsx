import { SiteHeader } from "~/components/site-header";
import { SidebarProvider } from "~/components/ui/sidebar";
import { useUser } from "~/hooks/loaders";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader user={user} />
        <div className="flex flex-1">{children}</div>
      </SidebarProvider>
    </div>
  );
}
