import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { Label } from "~/components/ui/label";
import { SidebarInput } from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function SearchForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [search, setSearch] = useSearchParams();
  const [debouncedSearch, setDebouncedSearch] = useState(search.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (debouncedSearch) {
        setSearch({ q: debouncedSearch }, { replace: true });
      } else {
        // Remove the query parameter if search is empty
        search.delete("q");
        setSearch(search, { replace: true });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [debouncedSearch]);

  return (
    <div className={cn("relative", className)} {...props}>
      <Label htmlFor="search" className="sr-only">
        Search
      </Label>
      <SidebarInput
        id="search"
        placeholder="Search games..."
        className="h-8 pl-7"
        value={debouncedSearch}
        onChange={(e) => {
          setDebouncedSearch(e.target.value);
        }}
      />
      <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
    </div>
  );
}
