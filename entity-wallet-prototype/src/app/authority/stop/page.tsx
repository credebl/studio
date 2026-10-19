import type { Metadata } from "next";

import { StopSomethingView } from "@/features/designation/StopSomethingView";

export const metadata: Metadata = { title: "Stop something — NDI Studio" };

export default function Page() {
  return <StopSomethingView />;
}
