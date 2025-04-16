import { clsx, type ClassValue } from "clsx";
import type { UIMatch } from "react-router";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Handle<T> = { breadcrumb: (match: UIMatch<T>) => React.ReactNode };
