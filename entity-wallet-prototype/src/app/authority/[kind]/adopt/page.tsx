import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AdoptView } from "@/features/designation/AdoptView";
import type { OrgKind } from "@/lib/demoData";

export const metadata: Metadata = { title: "Adopt — NDI Studio" };

const KINDS: OrgKind[] = ["company", "sole_proprietorship", "partnership"];

export default async function Page({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!KINDS.includes(kind as OrgKind)) notFound();
  return (
    <Suspense>
      <AdoptView kind={kind as OrgKind} />
    </Suspense>
  );
}
