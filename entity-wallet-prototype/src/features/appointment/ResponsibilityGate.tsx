"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * Nothing on an organisation is usable until its representative has
 * accepted responsibility for it (FLOW-DEL-02, DEL-02/E1 and E2).
 *
 * WHY HERE, AND NOT ON EACH SCREEN
 *
 * The gate used to sit on the dashboard and SCR-ORG-07 only, so the
 * sidebar still led to giving authority, inviting members, the wallet and
 * issuing roles — every one of them usable by an organisation nobody had yet
 * agreed to act for. Putting it in the console's shell covers every route
 * at once, including the ones added later, and the nav can stay as it is:
 * whatever is opened says the same thing.
 *
 * The representative is offered the acceptance; anyone else is told whose
 * it is to give. Which state applies is the store's record, not this
 * component's judgement.
 */
export function ResponsibilityGate({ children }: { children: ReactNode }) {
  const { responsibilities, activeOrgId, organizations, relations, people, harness } = useDemo();
  const state = responsibilities.find((r) => r.orgId === activeOrgId)?.state;
  if (!state || state === "ACCEPTED") return <>{children}</>;

  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "This organisation";
  const root = relations.find((r) => inOrg(activeOrgId)(r) && r.isRootAuthority);
  const rep = people.find((p) => p.id === root?.personId);
  const isRep = root?.personId === harness.persona;

  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-3" role="status">
        <p className="m-0 max-w-[62ch] text-[14px] leading-[1.65] text-body">
          {!isRep
            ? `${orgName} is verified, but it can't be used until ${rep?.name ?? "its representative"} accepts responsibility for acting on its behalf.`
            : state === "DECLINED"
              ? `You've declined. Nobody can act for ${orgName} until someone accepts.`
              : `${orgName} is verified. Before you can use it, accept responsibility for acting on its behalf.`}
        </p>
        {isRep ? (
          <div>
            <Link href="/onboarding/responsibility">
              <GradientButton>{state === "DECLINED" ? "Reopen and accept" : "Accept responsibility"}</GradientButton>
            </Link>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
