import type { Metadata } from "next";

import { OrganisationView } from "@/features/appointment/OrganisationView";

export const metadata: Metadata = { title: "Your organisation — NDI Studio" };

export default function Page() {
  return <OrganisationView />;
}
