import type { Metadata } from "next";

import { GiveAuthorityView } from "@/features/appointment/GiveAuthorityView";

export const metadata: Metadata = { title: "Give someone authority — NDI Studio" };

export default function Page() {
  return <GiveAuthorityView />;
}
