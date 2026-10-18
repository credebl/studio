import type { Metadata } from "next";

import { AskNdiView } from "@/features/accreditation/AskNdiView";

export const metadata: Metadata = { title: "Ask NDI — NDI Studio" };

export default function Page() {
  return <AskNdiView />;
}
