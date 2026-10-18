import type { Metadata } from "next";

import { AcceptAccreditationView } from "@/features/accreditation/AcceptAccreditationView";

export const metadata: Metadata = { title: "What you're being approved for — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AcceptAccreditationView id={decodeURIComponent(id)} />;
}
