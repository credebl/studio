import type { Metadata } from "next";

import { ReviewCredentialView } from "@/features/receive/ReviewCredentialView";

export const metadata: Metadata = { title: "Review a credential — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewCredentialView requestId={decodeURIComponent(id)} />;
}
