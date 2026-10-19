import type { Metadata } from "next";

import { AuthorityConsoleView } from "@/features/designation/AuthorityConsoleView";

export const metadata: Metadata = { title: "Your authority — NDI Studio" };

export default function Page() {
  return <AuthorityConsoleView />;
}
