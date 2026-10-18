import type { Metadata } from "next";

import { ApprovalStatusView } from "@/features/accreditation/ApprovalStatusView";

export const metadata: Metadata = { title: "Verify or issue — NDI Studio" };

export default function Page() {
  return <ApprovalStatusView />;
}
