import type { Metadata } from "next";

import { GetCredentialView } from "@/features/receive/GetCredentialView";

export const metadata: Metadata = { title: "Get a credential — NDI Studio" };

export default function Page() {
  return <GetCredentialView />;
}
