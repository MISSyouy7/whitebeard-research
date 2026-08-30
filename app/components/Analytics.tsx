"use client";

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string | number | boolean>) => void };
  }
}

export function trackEvent(name: string, data: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.umami?.track(name, data);
}

export function AnalyticsScript() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return null;
  const source = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ?? "https://cloud.umami.is/script.js";
  return <script defer src={source} data-website-id={websiteId} data-do-not-track="true" />;
}
