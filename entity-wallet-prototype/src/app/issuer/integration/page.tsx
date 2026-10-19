import type { Metadata } from "next";

import { IntegrationView } from "@/features/receive/IntegrationView";

export const metadata: Metadata = { title: "Integration settings — NDI Studio" };

export default function Page() {
  return <IntegrationView />;
}
