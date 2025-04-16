import { SidebarIcon } from "lucide-react";
import { href, Link, useMatches, type UIMatch } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { ModeToggle } from "~/components/mode-toggle";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { useSidebar } from "~/components/ui/sidebar";
import type { User } from "~/database/schema";
import type { Handle } from "~/lib/utils";

export function SiteHeader({ user }: { user?: User }) {
  const { toggleSidebar } = useSidebar();
  const matches = useMatches() as UIMatch<unknown, Handle<unknown>>[];

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
        {user && (
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>
        )}
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">
                <h2 className="text-md font-semibold">Home</h2>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {matches
              .filter((match) => match.handle)
              .map((match) => (
                <Fragment key={match.id}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem key={match.id}>
                    <BreadcrumbLink href={match.pathname}>
                      {match.handle.breadcrumb?.(match)}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </Fragment>
              ))}
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
        <ModeToggle />
      </div>
    </header>
  );
}
