"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { NDI_ORG } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

type Face = "unverified" | "in_progress" | "verified";

/**
 * Verify an organisation already on the platform — FLOW-ORG-01 Kind E (A1).
 *
 * A DIRECT ACTION, NOT A REQUEST TO NDI
 *
 * Bank of Bhutan has issued and verified on NDI for years; it has an owner
 * account, but its registration has never been confirmed by the authority,
 * so it holds nothing of its own. This screen used to have it *ask NDI* for
 * a wallet, wait for a platform administrator to approve, and then receive
 * an invitation. None of that is in the specification. NDI does not decide
 * whether an organisation may be verified: the owner verifies it the same
 * way a new organisation is verified — the type, the registration number,
 * the authority's identity request — and the authority decides. Kind E
 * differs only in that the record points at the organisation that exists,
 * and step 9 sets it up instead of creating another.
 *
 * WHAT CHANGES, SAID BEFORE ANYONE ASKS
 *
 * Nothing about what the bank issues or verifies. The screen says so up
 * front, because the obvious worry from someone running an issuer is that
 * starting something new puts the existing thing at risk.
 */
export function EntityWalletRequestView() {
  const router = useRouter();
  const { organizations, activeOrgId, orgOnboarding, startOrgOnboarding } = useDemo();
  const forced = useScreenState("SCR-ORG-A1", ["live", "unverified", "in_progress", "verified"]);

  /* Only an organisation outside NDI can be verified. Driven as one of
     NDI's own people (when reviewing a forced state), Bank of Bhutan stands
     in, since it is the organisation this screen exists for. */
  const org =
    organizations.find((o) => o.id === activeOrgId && o.id !== NDI_ORG) ?? organizations.find((o) => o.id === "org-bob");
  const name = org?.name ?? "Your organisation";
  const mine = org && orgOnboarding?.existingOrgId === org.id ? orgOnboarding : null;
  const natural: Face = org?.capabilities.includes("holder")
    ? "verified"
    : mine && ["proof_requested", "checking", "setting_up"].includes(mine.stage)
      ? "in_progress"
      : "unverified";
  const face: Face = forced === "live" ? natural : (forced as Face);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        <PageHeader crumbs={[{ label: name }, { label: "Verification" }]} title={`Verify ${name}`} />

        {face === "unverified" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 max-w-[60ch] text-[14px] leading-[1.6] text-body">
                  {name} hasn&rsquo;t been verified yet. Verify it to start using it.
                </p>
                <StatusPill status="unverified" label="Not verified" />
              </div>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                You&rsquo;ll enter its registration number, and the authority that registered it asks
                your NDI wallet who you are and checks its own records. If they show you as a
                representative, {name} gets a wallet of its own holding its registration.
              </p>
              <div>
                <GradientButton
                  onClick={() => {
                    startOrgOnboarding("company", null, org?.id ?? activeOrgId);
                    router.push("/onboarding");
                  }}
                >
                  <Icon name="shieldCheck" size={15} strokeWidth={2} />
                  Verify {name}
                </GradientButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {face === "in_progress" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Being verified</h2>
                <StatusPill status="processing" label="In progress" />
              </div>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                The authority is checking{" "}
                <span className="font-mono">{mine?.identifier ?? "CRA-1997-00112"}</span>. Nothing about
                what {name} does today has changed.
              </p>
              <div>
                <HairlineButton
                  onClick={() =>
                    router.push(mine?.stage === "proof_requested" ? "/onboarding/prove" : "/onboarding/verifying?resumed=1")
                  }
                >
                  Check progress
                </HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {face === "verified" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">{name} is verified</h2>
                <StatusPill status="verified" label="Verified" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/wallet/credentials">
                  <GradientButton>See what it holds</GradientButton>
                </Link>
                <Link href="/dashboard">
                  <HairlineButton>Go to the dashboard</HairlineButton>
                </Link>
              </div>
            </div>
          </Panel>
        ) : null}

        <Panel>
          <div className="relative z-[4] grid gap-4 min-[761px]:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What verifying adds</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                A wallet of {name}&rsquo;s own, holding its registration — confirmed by the authority
                that registered it.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What doesn&rsquo;t change</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                Everything it issues and verifies today carries on exactly as it is, throughout.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
