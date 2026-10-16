"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { OnboardingShell } from "@/features/onboarding/OnboardingShell";
import { kindOf } from "@/features/onboarding/orgKinds";
import { PELDEN, VERIFICATION_ORG_NAME, inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { FullTerms, Responsibilities } from "./Responsibilities";

/**
 * SCR-DEL-01 — Your responsibility for {organisation}. FLOW-DEL-02.
 *
 * WHY THIS SCREEN EXISTS
 *
 * The authority's confirmation makes Dorji the organisation's
 * representative; it does not, by itself, make Dorji someone who has agreed
 * to act for it. Until this screen the prototype went straight from
 * verification to appointing other people, so Dorji held the organisation's
 * full authority without ever being shown what it asks of them — and UC-19,
 * which measures whether the representative understood it, had no screen to
 * test. Now verification ends here, and nothing on the organisation can be
 * used until it is accepted.
 *
 * NO SCAN, IN THE SAME SESSION
 *
 * Dorji presented their citizen credential to the authority a minute ago, on
 * SCR-ORG-03, and that is what the authority decided on. Asking again here
 * would spend the flow's one scan a second time at the point people abandon
 * most (UXD-21). So straight after verifying, it is one click. Coming back
 * in a later session is different: then the person confirms with their NDI
 * wallet first (DEL-02/E6), because the session is no longer the one the
 * authority's decision was made in.
 *
 * WHAT IT MUST SAY
 *
 * The organisation as the authority recorded it; that the authority named
 * this person; what they can and cannot do; their responsibilities as
 * things to do; that every action is recorded against their name; and that
 * NDI holds the organisation's keys. Acting for an organisation is a duty
 * before it is a permission, and the screen leads with that.
 */
type Face = "default" | "returning" | "not_representative" | "could_not_finish" | "not_confirmed" | "offline";

export function ResponsibilityView() {
  const router = useRouter();
  const { orgOnboarding, orgInvitations, organizations, relations, people, harness, acceptResponsibility, declineResponsibility, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-DEL-01", [
    "live",
    "default",
    "returning",
    "not_representative",
    "could_not_finish",
    "not_confirmed",
    "offline",
  ]);

  const kind = kindOf(orgOnboarding?.kind);
  const invitation = orgInvitations.find((i) => i.id === orgOnboarding?.invitationId);
  const orgId = orgOnboarding?.existingOrgId ?? (invitation?.kind === "W" ? invitation.orgId : null) ?? PELDEN;
  const org = organizations.find((o) => o.id === orgId);
  const legalName = orgOnboarding?.authoritativeName ?? org?.legalName ?? org?.name ?? "Pelden Trading Pvt. Ltd.";
  const shortName = legalName.replace(/ (Pvt\. )?Ltd\.$/, "");
  const root = relations.find((r) => inOrg(orgId)(r) && r.isRootAuthority);
  const representative = people.find((p) => p.id === root?.personId);

  /* Straight from SCR-ORG-04, in the verifying session — or not. Read once
     from the address, without useSearchParams, so no suspense boundary is
     needed for a flag. */
  const [fresh, setFresh] = useState<boolean | null>(null);
  useEffect(() => setFresh(new URLSearchParams(window.location.search).has("fresh")), []);
  const [stepUp, setStepUp] = useState<"idle" | "waiting" | "done">("idle");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<"E3" | "E4" | null>(null);

  const natural: Face =
    failed === "E3" || (root && root.personId !== harness.persona)
      ? "not_representative"
      : failed === "E4"
        ? "not_confirmed"
        : fresh === false && stepUp !== "done"
          ? "returning"
          : "default";
  const face: Face = forced === "live" ? natural : (forced as Face);

  if (!hydrated || fresh === null) {
    return (
      <OnboardingShell current={4}>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  const accept = () => {
    setBusy(true);
    window.setTimeout(() => {
      const r = acceptResponsibility(orgId);
      setBusy(false);
      if (r.ok) router.push("/onboarding/foundational");
      else setFailed(r.error);
    }, LOCAL_MS);
  };

  return (
    <OnboardingShell current={4}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          Your responsibility for {shortName}
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          The {kind.authority} has {legalName} recorded with you as its representative. Before{" "}
          {shortName} can be used, accept responsibility for acting on its behalf.
        </p>
      </div>

      {face === "not_representative" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 text-[14px] leading-[1.6] text-body">
              Only {representative?.name ?? "the representative the authority recorded"} can accept
              responsibility for {legalName}.
            </p>
            <div>
              <HairlineButton onClick={() => router.push("/welcome")}>Leave</HairlineButton>
            </div>
          </div>
        </Panel>
      ) : face === "not_confirmed" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="alert">
            <p className="m-0 text-[14px] leading-[1.6] text-body">
              {legalName}&rsquo;s registration can&rsquo;t be confirmed right now, so it can&rsquo;t be
              used. The {kind.authority} holds its record.
            </p>
            <div>
              <HairlineButton onClick={() => router.push("/welcome")}>Leave</HairlineButton>
            </div>
          </div>
        </Panel>
      ) : (
        <>
          <Panel>
            <div className="relative z-[4] grid gap-5 min-[761px]:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What you&rsquo;ll be able to do</h2>
                <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                  Act for {shortName} in everything: receive, accept and share its credentials, and
                  approve what others ask to do.
                </p>
                <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                  Give other people authority to act for it — only you can.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What you can&rsquo;t do</h2>
                <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                  Take {shortName}&rsquo;s credentials off the platform on your own.
                </p>
                <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                  Hold its keys. NDI keeps them.
                </p>
              </div>
            </div>
          </Panel>

          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <Responsibilities orgName={shortName} />
              <FullTerms orgName={shortName} />
            </div>
          </Panel>

          {face === "returning" ? (
            <Panel>
              <WalletHandoff
                value="ndi-root-step-up"
                title={`${VERIFICATION_ORG_NAME} is asking who you are`}
                purpose="To accept, confirm it's you with your NDI wallet. It's been a while since you verified the organisation."
                sharing={["Your identity, from your citizen credential"]}
                notSharing={["Anything about the organisation", "Anything else in your wallet"]}
                status={stepUp === "idle" ? "awaiting_scan" : "waiting"}
                onSimulateScan={() => {
                  setStepUp("waiting");
                  window.setTimeout(() => setStepUp("done"), WALLET_HANDOFF_MS);
                }}
              />
            </Panel>
          ) : null}

          {face === "could_not_finish" ? (
            <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              We couldn&rsquo;t finish that. Nothing has changed — try again.
            </p>
          ) : null}
          {face === "offline" ? (
            <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              You&rsquo;re offline. Once you&rsquo;re back, this page will say whether your acceptance was
              recorded — it won&rsquo;t guess.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5">
            <GradientButton onClick={accept} disabled={busy || face === "returning" || face === "offline"}>
              {busy ? "Recording…" : face === "could_not_finish" ? "Accept again" : "Accept responsibility"}
            </GradientButton>
            <HairlineButton
              onClick={() => {
                declineResponsibility(orgId);
                router.push("/onboarding/foundational");
              }}
              disabled={face === "offline"}
            >
              Decline
            </HairlineButton>
          </div>
        </>
      )}
    </OnboardingShell>
  );
}
