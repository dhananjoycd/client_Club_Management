import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function joinUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase;
}
