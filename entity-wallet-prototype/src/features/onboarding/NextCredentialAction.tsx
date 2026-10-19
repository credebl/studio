"use client";

import { useRouter } from "next/navigation";

import { GradientButton } from "@/components/ui/GradientButton";
import { Icon } from "@/components/ui/icons";

/**
 * The next credential in the chain — for a company, its tax identity (TPN)
 * from the Department of Revenue & Customs, applied for with the
 * registration it already holds (UX-EW-01 UXD-14).
 *
 * It is the primary action wherever a newly verified organisation is asked
 * "what next" — SCR-ORG-07 and the first day's dashboard — because it is
 * what the person most likely came for and what shows the wallet works.
 *
 * It opens the catalogue (SCR-CRD-01), not the TPN's consent screen
 * directly: the catalogue is where the business sees what the Department
 * needs to see first, and that belongs before the consent, not folded into
 * it. Until Flow 6 this button said, when pressed, that the flow wasn't
 * built yet.
 */
export function NextCredentialAction() {
  const router = useRouter();
  return (
    <GradientButton onClick={() => router.push("/wallet/get")}>
      <Icon name="credentials" size={16} strokeWidth={2} />
      Get its tax identity (TPN)
    </GradientButton>
  );
}
