import React, { Suspense } from "react";
import RestaurantWebsite from "@/components/RestaurantWebsite";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100" />}>
      <RestaurantWebsite />
    </Suspense>
  );
}