import type { Metadata } from "next";

import { ReviewRequestView } from "@/features/accreditation/ReviewRequestView";

export const metadata: Metadata = { title: "Review a request — NDI administration" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewRequestView id={decodeURIComponent(id)} />;
}
