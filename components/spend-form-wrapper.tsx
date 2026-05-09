"use client";

import dynamic from "next/dynamic";

const SpendForm = dynamic(
  () => import("@/components/spend-form"),
  {
    ssr: false,
  }
);

export default function SpendFormWrapper() {
  return <SpendForm />;
}