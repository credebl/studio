import type { Metadata } from "next";

import { AcceptDesignationView } from "@/features/designation/AcceptDesignationView";

export const metadata: Metadata = { title: "What is being proposed — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AcceptDesignationView id={decodeURIComponent(id)} />;
}
