import { SidebarIcon } from "lucide-react";
import { href, Link } from "react-router";

import { SearchForm } from "~/components/search-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/components/ui/sidebar";
import { WebsimLogo } from "~/components/websim-logo";
import type { User } from "~/database/schema";

export function SiteHeader({ user }: { user?: User }) {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <WebsimLogo />
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2 sm:ml-auto sm:w-auto">
          {!user && (
            <Link to={href("/login")}>
              <Button variant="outline" className="">
                Login
              </Button>
            </Link>
          )}
        </div>
        <SearchForm className="w-full sm:w-auto" />
      </div>
    </header>
  );
}
