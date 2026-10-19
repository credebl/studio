import type { Metadata } from "next";

import { ProposeDesignationView } from "@/features/designation/ProposeDesignationView";

export const metadata: Metadata = { title: "Propose a designation — NDI administration" };

export default function Page() {
  return <ProposeDesignationView />;
}
