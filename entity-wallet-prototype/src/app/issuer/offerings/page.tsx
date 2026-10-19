import type { Metadata } from "next";

import { OfferingsView } from "@/features/receive/OfferingsView";

export const metadata: Metadata = { title: "What you offer on request — NDI Studio" };

export default function Page() {
  return <OfferingsView />;
}
