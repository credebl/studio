import type { Metadata } from "next";

import { AskingForMoreView } from "@/features/receive/AskingForMoreView";

export const metadata: Metadata = { title: "Asking for more — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AskingForMoreView requestId={decodeURIComponent(id)} />;
}
