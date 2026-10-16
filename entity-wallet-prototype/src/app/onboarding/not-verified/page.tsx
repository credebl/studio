import type { Metadata } from "next";

import { NotVerifiedView } from "@/features/onboarding/NotVerifiedView";

export const metadata: Metadata = { title: "Not verified — NDI Studio" };

export default function NotVerifiedPage() {
  return <NotVerifiedView />;
}
