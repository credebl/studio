import type { Metadata } from "next";

import { EntityProfileView } from "@/features/controllership/EntityProfileView";

export const metadata: Metadata = { title: "Organisation record — NDI Studio" };

export default function EntityPage() {
  return <EntityProfileView />;
}
