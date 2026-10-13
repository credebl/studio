import type { Metadata } from "next";

import { EntityWalletRequestView } from "@/features/entityWallet/EntityWalletRequestView";

export const metadata: Metadata = { title: "Entity Wallet — NDI Studio" };

export default function EntityWalletPage() {
  return <EntityWalletRequestView />;
}
