"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { NextCredentialAction } from "@/features/onboarding/NextCredentialAction";
import { inOrg, shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { presetOf } from "./presets";

/**
 * SCR-ORG-07 — the organisation, from inside the console.
 *
 * The same screen the representative met at the end of verification, now
 * reached from the console — and the one an appointee lands on once they
 * accept (FLOW-DEL-01 step 9). What it shows depends on who is looking:
 *
 * - The representative sees everything: the next credential as the primary
 *   action, and giving someone authority and seeing who can act beside it.
 * - An appointed person sees only what their authority covers, in the
 *   words of the preset they were given, with what it doesn't cover
 *   beside it (the negative clause).
 * - A member with no authority sees the organisation named and nothing
 *   they could act on.
 *
 * It replaced an acceptance that ended on a list of operations in "My
 * authority", which an appointee had to read in the console's own terms.
 */
type Face = "live" | "representative" | "appointed" | "member";

export function OrganisationView() {
  const { organizations, activeOrgId, relations, harness } = useDemo();
  const forced = useScreenState("SCR-ORG-07-console", ["live", "representative", "appointed", "member"]) as Face;

  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "Pelden Trading Pvt. Ltd.";
  const short = shortOrgName(orgName);
  const mine = relations.find((r) => inOrg(activeOrgId)(r) && r.personId === harness.persona && r.state === "ACTIVE");
  const face: Face =
    forced !== "live" ? forced : mine?.isRootAuthority ? "representative" : mine ? "appointed" : "member";
  const preset = presetOf(face === "appointed" ? (mine?.preset ?? "receive") : undefined);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <PageHeader crumbs={[{ label: orgName }]} title={orgName} />
        <p className="m-0 flex flex-wrap items-center gap-2.5 text-[13.5px] text-muted">
          <StatusPill status="verified" label="Verified" />
          Its registration is held in its own wallet.
        </p>

        {face === "representative" ? (
          <>
            <Panel>
              <div className="relative z-[4] flex flex-col gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Next</h2>
                <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-body">
                  Get {short}&rsquo;s tax identity (TPN), applied for with the registration it holds.
                </p>
                <div className="flex flex-wrap items-start gap-2.5">
                  <NextCredentialAction orgName={short} />
                  <Link href="/wallet/credentials">
                    <HairlineButton>View the credential</HairlineButton>
                  </Link>
                </div>
              </div>
            </Panel>
            <Panel>
              <div className="relative z-[4] flex flex-col gap-2">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What {short} can do</h2>
                <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                  Receive credentials issued to it, and present them when asked.
                </p>
                <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                  It can&rsquo;t issue credentials to others or verify anyone else&rsquo;s.
                </p>
                {/* UXD-24: not for a sole proprietorship. */}
                {org?.kind === "sole_proprietorship" ? null : (
                <div className="mt-2 flex flex-wrap items-center gap-2.5">
                  <Link href="/people-who-can-act/give">
                    <HairlineButton>Give someone authority to act</HairlineButton>
                  </Link>
                  <Link href="/people-who-can-act" className="ndi-plainlink text-[12.5px] font-medium text-muted">
                    See who can act
                  </Link>
                </div>
                )}
              </div>
            </Panel>
          </>
        ) : face === "appointed" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">You can act for {short}</h2>
              <p className="m-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{preset?.label}</p>
              {preset?.allows.map((a) => (
                <p key={a} className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                  {a}
                </p>
              ))}
              {preset?.doesNotAllow.map((a) => (
                <p key={a} className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                  You can&rsquo;t: {a.charAt(0).toLowerCase() + a.slice(1)}
                </p>
              ))}
              <div className="mt-1 flex flex-wrap gap-2.5">
                <Link href="/wallet/credentials">
                  <HairlineButton>See what it holds</HairlineButton>
                </Link>
                <Link href="/people-who-can-act" className="ndi-plainlink self-center text-[12.5px] font-medium text-muted">
                  Your authority
                </Link>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel>
            <p className="relative z-[4] m-0 text-[13.5px] leading-[1.6] text-body">
              You&rsquo;re a member of {short}. You can see it, but you can&rsquo;t act for it — that&rsquo;s
              given separately.
            </p>
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
