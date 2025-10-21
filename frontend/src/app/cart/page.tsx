"use client";
import Cart from "@/pages/Cart";
import RequireAuth from "@/components/RequireAuth";

export default function Page() {
  return (
    <RequireAuth redirectTo="/auth/login">
      <Cart />
    </RequireAuth>
  );
}


