import type { Metadata } from "next";

import { OrganisationsAdminView } from "@/features/admin/OrganisationsAdminView";

export const metadata: Metadata = { title: "Organisations — NDI administration" };

export default function OrganisationsAdminPage() {
  return <OrganisationsAdminView />;
}
