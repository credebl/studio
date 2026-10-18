"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { NDI_ORG } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * Organisations — what each one may do on the platform.
 *
 * THREE GRANTS, ONE PLACE
 *
 * Issuing, verifying and holding are separate, and an organisation can have
 * any mix: Bank of Bhutan issues and verifies, and holds once its owner has
 * verified it; Pelden holds and does neither of the others. Showing all
 * three side by side, per organisation, shows that verifying adds to what a
 * bank does rather than replacing it.
 *
 * NO DECISIONS HERE ANY MORE
 *
 * This page used to hold a queue of "access requests" an administrator
 * approved with one click. Flow 4 replaced that: approval to verify or
 * issue is an accreditation, with two administrators and the
 * organisation's own acceptance, and it lives on its own page. Holding was
 * never NDI's to grant — an organisation holds once the authority that
 * registered it confirms its representative (FLOW-ORG-01). So this is a
 * read-only view of where each organisation stands, with the way to
 * accreditations beside it.
 */
export function OrganisationsAdminView() {
  const { organizations, accreditations } = useDemo();
  const forced = useScreenState("SCR-ADM-02", ["default", "loading", "offline"]);
  const waiting = accreditations.filter((a) => ["PROPOSED", "SUBMITTED", "IN_REVIEW"].includes(a.state)).length;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Organisations" }]} title="Organisations" />
        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          What each organisation may do on the platform. Approval to verify or issue is decided in{" "}
          <Link href="/admin/accreditations" className="ndi-plainlink font-medium text-accent">
            accreditations
          </Link>
          {waiting ? ` — ${waiting} waiting` : ""}. Whether an organisation is verified is its authority&rsquo;s decision.
        </p>
        {forced === "offline" ? (
          <p role="status" className="rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is how things stood when you were last connected.
          </p>
        ) : null}

        <section aria-labelledby="orgs-heading" className="flex flex-col gap-3">
          <h2 id="orgs-heading" className="m-0 font-display text-[16px] font-semibold text-strong">
            On the platform
          </h2>
          {forced === "loading" ? (
            <div aria-hidden="true" className="h-40 animate-pulse rounded-[16px] border border-grid" />
          ) : (
            <Panel padded={false}>
              <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
                {/* NDI's own organisation runs the platform; it is not on it. */}
                {organizations.filter((o) => o.id !== NDI_ORG).map((o, i) => {
                  return (
                    <li key={o.id} className={`flex flex-col gap-2.5 px-5 py-4 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between ${i > 0 ? "border-t border-subtle" : ""}`}>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-[14px] font-medium text-body">{o.name}</span>
                        <span className="text-[12.5px] text-faint">{o.description}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <StatusPill status={o.capabilities.includes("issuer") ? "active" : "inactive"} label={o.capabilities.includes("issuer") ? "Issues" : "Doesn't issue"} />
                        <StatusPill status={o.capabilities.includes("verifier") ? "active" : "inactive"} label={o.capabilities.includes("verifier") ? "Verifies" : "Doesn't verify"} />
                        <StatusPill
                          status={o.capabilities.includes("holder") ? "verified" : "unverified"}
                          label={o.capabilities.includes("holder") ? "Verified" : "Not verified"}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </section>
      </div>
    </AppShell>
  );
}
