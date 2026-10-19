import type { Metadata } from "next";

import { DesignationsAdminView } from "@/features/designation/DesignationsAdminView";

export const metadata: Metadata = { title: "Designations — NDI administration" };

export default function Page() {
  return <DesignationsAdminView />;
}
