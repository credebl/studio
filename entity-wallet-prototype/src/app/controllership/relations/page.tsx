import type { Metadata } from "next";

import { PeopleWhoCanActView } from "@/features/appointment/PeopleWhoCanActView";

export const metadata: Metadata = { title: "People who can act — NDI Studio" };

export default function Page() {
  return <PeopleWhoCanActView />;
}
