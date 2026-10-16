import type { Metadata } from "next";

import { NotSupportedView } from "@/features/onboarding/NotSupportedView";

export const metadata: Metadata = { title: "Not supported yet — NDI Studio" };

export default function NotSupportedPage() {
  return <NotSupportedView />;
}
