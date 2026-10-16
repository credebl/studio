"use client";

import { useState } from "react";

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
 * Requesting a credential is FLOW-CRD-01, which this prototype does not
 * build. Rather than a primary button that silently goes nowhere, or a
 * different primary that would teach the wrong order, the button stays and
 * says plainly what it would do.
 */
export function NextCredentialAction({ orgName }: { orgName: string }) {
  const [note, setNote] = useState(false);
  return (
    <span className="flex flex-col items-start gap-2">
      <GradientButton onClick={() => setNote(true)}>
        <Icon name="credentials" size={16} strokeWidth={2} />
        Get its tax identity (TPN)
      </GradientButton>
      {note ? (
        <span role="status" className="text-[12.5px] leading-[1.5] text-faint">
          Prototype — asking the Department of Revenue &amp; Customs for {orgName}&rsquo;s TPN is the next
          flow, and isn&rsquo;t built here yet.
        </span>
      ) : null}
    </span>
  );
}
