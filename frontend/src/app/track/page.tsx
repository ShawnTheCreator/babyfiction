"use client";
import { Suspense } from "react";
import Track from "@/pages/Track";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <Track />
    </Suspense>
  );
}


