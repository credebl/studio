import type { Metadata } from "next";

import { InvitationView } from "@/features/invitations/PlatformInvitationView";

export const metadata: Metadata = { title: "Your invitation — NDI Studio" };

export default async function InvitationPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  return <InvitationView id={invitationId} />;
}
