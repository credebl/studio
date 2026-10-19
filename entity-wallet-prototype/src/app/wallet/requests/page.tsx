import type { Metadata } from "next";

import { RequestsView } from "@/features/receive/RequestsView";

export const metadata: Metadata = { title: "Requests and offers — NDI Studio" };

export default function Page() {
  return <RequestsView />;
}
