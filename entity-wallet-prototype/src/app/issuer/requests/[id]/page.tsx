import type { Metadata } from "next";

import { AnswerRequestView } from "@/features/receive/AnswerRequestView";

export const metadata: Metadata = { title: "Answer a request — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AnswerRequestView requestId={decodeURIComponent(id)} />;
}
