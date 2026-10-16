import type { Metadata } from "next";

import { ReviewAppointmentView } from "@/features/appointment/ReviewAppointmentView";

export const metadata: Metadata = { title: "Review your appointment — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ relationId: string }> }) {
  const { relationId } = await params;
  return <ReviewAppointmentView relationId={decodeURIComponent(relationId)} />;
}
