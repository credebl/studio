import type { Metadata } from "next";

import { ActivationResultView } from "@/features/designation/ActivationResultView";

export const metadata: Metadata = { title: "Activation result — NDI Studio" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ActivationResultView id={decodeURIComponent(id)} />;
}
