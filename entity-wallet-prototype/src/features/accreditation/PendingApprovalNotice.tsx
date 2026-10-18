"use client";

import Link from "next/link";

import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { ENFORCEMENT_DATE } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { daysUntil } from "./shared";

/**
 * The organisation dashboard's way into SCR-ACC-03 — the specification's
 * "notification to the organisation's OWNER; organisation dashboard" entry
 * point. Every pending item reachable from a list, never only from an
 * email, with the time it has left (UX-EW-02 §3.4). For recognition it
 * carries the enforcement date, because an officer who misses it finds out
 * by being refused (Journey I).
 */
export function PendingApprovalNotice() {
  const { accreditations, activeOrgId } = useDemo();
  const now = new Date().toISOString().slice(0, 10);
  const pending = accreditations.filter(
    (a) => a.orgId === activeOrgId && a.state === "PENDING_ACCEPTANCE" && !(a.expiresAt && a.expiresAt < now),
  );
  if (!pending.length) return null;
  return (
    <>
      {pending.map((a) => (
        <Panel key={a.id}>
          <div className="relative z-[4] flex flex-col gap-3 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between">
            <div className="flex flex-col gap-1.5">
              <StatusPill status="pending_acceptance" label="Waiting for you to accept" />
              <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">
                NDI has proposed approving {a.orgName.replace(/ (Pvt\. )?Ltd\.$/, "")} to{" "}
                {a.capability === "verifier" ? "verify customers" : "issue credentials"}. {daysUntil(a.expiresAt)} days
                left to decide.
                {a.door === "RECOGNITION" ? ` Without it, what you already do stops on ${formatDate(ENFORCEMENT_DATE)}.` : ""}
              </p>
            </div>
            <Link href={`/verify-or-issue/${a.id}`} className="flex-none">
              <GradientButton>Review it</GradientButton>
            </Link>
          </div>
        </Panel>
      ))}
    </>
  );
}
