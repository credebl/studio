import type { Metadata } from "next";

import { PlatformAdminsView } from "@/features/admin/PlatformAdminsView";

export const metadata: Metadata = { title: "Platform admins — NDI administration" };

export default function PlatformAdminsPage() {
  return <PlatformAdminsView />;
}
