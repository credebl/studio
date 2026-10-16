import type { Metadata } from "next";

import { VerifyingView } from "@/features/onboarding/VerifyingView";

export const metadata: Metadata = { title: "Verifying — NDI Studio" };

export default function VerifyingPage() {
  return <VerifyingView />;
}
