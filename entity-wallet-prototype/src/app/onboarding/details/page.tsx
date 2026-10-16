import type { Metadata } from "next";

import { RegistrationDetailsView } from "@/features/onboarding/RegistrationDetailsView";

export const metadata: Metadata = { title: "Registration details — NDI Studio" };

export default function RegistrationDetailsPage() {
  return <RegistrationDetailsView />;
}
