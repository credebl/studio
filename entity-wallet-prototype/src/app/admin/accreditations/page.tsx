import type { Metadata } from "next";

import { AccreditationsAdminView } from "@/features/accreditation/AccreditationsAdminView";

export const metadata: Metadata = { title: "Accreditations — NDI administration" };

export default function Page() {
  return <AccreditationsAdminView />;
}
