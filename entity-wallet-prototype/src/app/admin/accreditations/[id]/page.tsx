import type { Metadata } from "next";

import { ApproveAccreditationView } from "@/features/accreditation/ApproveAccreditationView";

export const metadata: Metadata = { title: "Accreditation — NDI administration" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApproveAccreditationView id={decodeURIComponent(id)} />;
}
