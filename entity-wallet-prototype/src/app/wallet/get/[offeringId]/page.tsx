import type { Metadata } from "next";

import { AskForCredentialView } from "@/features/receive/AskForCredentialView";

export const metadata: Metadata = { title: "Ask for a credential — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ offeringId: string }> }) {
  const { offeringId } = await params;
  return <AskForCredentialView offeringId={decodeURIComponent(offeringId)} />;
}
