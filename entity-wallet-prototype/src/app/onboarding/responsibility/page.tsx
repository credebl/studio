import type { Metadata } from "next";

import { ResponsibilityView } from "@/features/appointment/ResponsibilityView";

export const metadata: Metadata = { title: "Your responsibility — NDI Studio" };

export default function ResponsibilityPage() {
  return <ResponsibilityView />;
}
