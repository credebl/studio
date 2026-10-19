import type { Metadata } from "next";

import { IssuerRequestsView } from "@/features/receive/IssuerRequestsView";

export const metadata: Metadata = { title: "Requests to answer — NDI Studio" };

export default function Page() {
  return <IssuerRequestsView />;
}
