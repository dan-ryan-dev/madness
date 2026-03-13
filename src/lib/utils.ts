import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  let url = process.env.NEXTAUTH_URL || process.env.AUTH_URL;

  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback
  if (!url || url === "undefined") {
    url = "http://localhost:3000";
  }

  return url.replace(/\/$/, "");
}
