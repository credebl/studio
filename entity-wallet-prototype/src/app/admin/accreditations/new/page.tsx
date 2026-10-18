import type { Metadata } from "next";

import { ProposeAccreditationView } from "@/features/accreditation/ProposeAccreditationView";

export const metadata: Metadata = { title: "Propose an accreditation — NDI administration" };

export default function Page() {
  return <ProposeAccreditationView />;
}
