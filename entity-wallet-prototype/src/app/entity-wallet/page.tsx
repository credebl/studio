import type { Metadata } from "next";

import { EntityWalletRequestView } from "@/features/entityWallet/EntityWalletRequestView";

export const metadata: Metadata = { title: "Verify your organisation — NDI Studio" };

export default function EntityWalletPage() {
  return <EntityWalletRequestView />;
}
