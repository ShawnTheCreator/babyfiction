"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

export default function AnalyticsClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    const referrer = typeof document !== "undefined" ? document.referrer : null;
    const utm: Record<string, string> = {};
    if (searchParams) {
      ["utm_source","utm_medium","utm_campaign","utm_term","utm_content"].forEach((k) => {
        const v = searchParams.get(k);
        if (v) utm[k] = v;
      });
    }
    track({ type: "page_view", route: url, referrer, utm });
  }, [pathname, searchParams]);

  return null;
}
