"use client";
import { Suspense } from "react";
import Admin from "@/pages/Admin";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <Admin />
    </Suspense>
  );
}


