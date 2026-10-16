"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { VERIFICATION_ORG_NAME, inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { SKIP_AFTER_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

/**
 * SCR-DEL-04 — Confirm with your NDI wallet. FLOW-DEL-01 steps 7–8.
 *
 * ONE APPROVAL IS THE ACCEPTANCE
 *
 * The request's challenge carries the appointment itself, so approving it
 * both proves who the appointee is and records that they accept these
 * terms (EW-FLOW3-SD/D7). The screen says so before the scan: there is no
 * separate "accept" afterwards, and nothing on the console can stand in for
 * it — not even for someone whose identity was confirmed before.
 *
 * WHO IS ASKING
 *
 * This is the one request in these flows that NDI sends rather than an
 * authority, because NDI is recording who acts for an organisation on its
 * own platform. It comes from NDI's dedicated verification organisation
 * (D15), and the screen names it exactly as the wallet will. Only identity
 * is shared.
 *
 * E7 SAYS NOTHING ABOUT WHY
 *
 * If the identity the wallet presents isn't the appointee's, the message is
 * neutral and names the representative to contact. Explaining the mismatch
 * would tell whoever is holding the phone what to change.
 */
type Stage = "idle" | "wallet" | "declined" | "could_not_confirm" | "no_wallet" | "expired" | "not_waiting";

export function ConfirmAppointmentView({ relationId }: { relationId: string }) {
  const router = useRouter();
  const { relations, people, organizations, harness, acceptAppointment, hydrated } = useDemo();
  const forced = useScreenState("SCR-DEL-04", ["live", "waiting", "same_device", "declined", "could_not_confirm", "no_wallet"]);
  const [stage, setStage] = useState<Stage>("idle");
  const [skippable, setSkippable] = useState(false);
  const [guidance, setGuidance] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const r = relations.find((x) => x.id === relationId);
  const org = organizations.find((o) => o.id === (r?.orgId ?? "org-pelden"));
  const orgName = org?.name ?? "Pelden Trading Pvt. Ltd.";
  const root = relations.find((x) => inOrg(org?.id ?? "org-pelden")(x) && x.isRootAuthority);
  const repName = people.find((p) => p.id === (r?.attestation?.attestedBy ?? root?.personId))?.name ?? "Dorji Wangchuk";

  const answer = (as: string) => {
    const res = acceptAppointment(relationId, as);
    if (res.ok) router.push("/organisation");
    /* Each refusal keeps its own message. E7's neutral wording is for an
       identity that didn't match and nothing else; an appointment no longer
       waiting (E8 — already accepted, declined or withdrawn) must not tell a
       valid appointee their identity failed. */
    else setStage(res.error === "E7" ? "could_not_confirm" : res.error === "E4" ? "expired" : "not_waiting");
  };

  const start = (outcome: "proved" | "declined" | "someone_else") => {
    setSkippable(false);
    setStage("wallet");
    timers.current.push(setTimeout(() => setSkippable(true), SKIP_AFTER_MS));
    timers.current.push(
      setTimeout(() => {
        if (outcome === "declined") setStage("declined");
        else answer(outcome === "proved" ? harness.persona : "karma");
      }, WALLET_HANDOFF_MS),
    );
  };

  const shown: Stage =
    forced === "live" || forced === "same_device" ? stage : forced === "waiting" ? "wallet" : (forced as Stage);
  const status: HandoffStatus =
    shown === "idle" ? "awaiting_scan" : shown === "wallet" ? "waiting" : shown === "expired" ? "expired" : "failed";

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const outcome = (title: string, body: React.ReactNode, actions: React.ReactNode) => (
    <Panel>
      <div className="relative z-[4] flex items-start gap-3" role="alert">
        <Icon name="close" size={18} strokeWidth={2.2} className="mt-0.5 flex-none" style={{ color: "var(--ndi-danger)" }} />
        <div className="flex flex-col gap-2">
          <p className="m-0 font-display text-[14.5px] font-semibold text-strong">{title}</p>
          <div className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">{body}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">{actions}</div>
        </div>
      </div>
    </Panel>
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        <PageHeader crumbs={[{ label: orgName }, { label: "Your appointment" }]} title="Confirm with your NDI wallet" />
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          Approving this request in your wallet is your acceptance of the authority to act for {orgName}.
          There&rsquo;s nothing else to press afterwards.
        </p>

        {shown === "declined"
          ? outcome(
              "You didn't approve the request",
              <>You didn&rsquo;t approve the request in your NDI wallet, so nothing has changed. You can try again.</>,
              <HairlineButton onClick={() => setStage("idle")}>
                <Icon name="refresh" size={14} strokeWidth={2} />
                Try again
              </HairlineButton>,
            )
          : null}
        {shown === "not_waiting" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 text-[14px] leading-[1.6] text-body">
                This appointment isn&rsquo;t waiting for an answer any more, so nothing has changed.
              </p>
              <div>
                <HairlineButton onClick={() => router.push(`/appointments/${relationId}`)}>See the appointment</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}
        {shown === "expired"
          ? outcome(
              "This appointment has expired",
              <>Ask {repName} to make it again.</>,
              <HairlineButton onClick={() => router.push("/dashboard")}>Leave</HairlineButton>,
            )
          : null}
        {shown === "could_not_confirm"
          ? outcome(
              "We couldn't confirm this appointment",
              <>We couldn&rsquo;t confirm this appointment. Contact {repName}.</>,
              <HairlineButton onClick={() => router.push("/dashboard")}>Leave</HairlineButton>,
            )
          : null}
        {shown === "no_wallet"
          ? outcome(
              "You'll need the NDI wallet",
              <>
                <p className="m-0">You&rsquo;ll need the NDI wallet app with your identity credential to accept this.</p>
                {guidance ? (
                  <p role="status" className="m-0 mt-2 text-faint">
                    Bhutan NDI Wallet is on the App Store and Google Play. Setting it up adds your identity
                    credential. Your appointment waits until it lapses.
                  </p>
                ) : null}
              </>,
              <>
                <HairlineButton onClick={() => setGuidance(true)}>How to get the NDI wallet</HairlineButton>
                <button type="button" onClick={() => router.push("/dashboard")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                  Leave
                </button>
              </>,
            )
          : null}

        {shown !== "no_wallet" && shown !== "could_not_confirm" && shown !== "expired" && shown !== "not_waiting" ? (
          <Panel>
            <WalletHandoff
              value={`ndi-appointment-${relationId}`}
              title={`${VERIFICATION_ORG_NAME} is asking who you are`}
              purpose={`NDI records who can act for ${orgName}. Approving confirms it's you and accepts the appointment.`}
              sharing={["Your identity, from your citizen credential"]}
              notSharing={["Anything else in your wallet"]}
              sameDevice={forced === "same_device"}
              status={status}
              statusDetail={shown === "declined" ? "You declined in the wallet. Nothing was shared." : undefined}
              onSimulateScan={() => start("proved")}
              onCancel={() => router.push(`/appointments/${relationId}`)}
              onResend={() => {
                timers.current.forEach(clearTimeout);
                setStage("idle");
              }}
              onSkip={
                skippable && shown === "wallet"
                  ? () => {
                      timers.current.forEach(clearTimeout);
                      answer(harness.persona);
                    }
                  : undefined
              }
            />
          </Panel>
        ) : null}

        {shown === "idle" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <HairlineButton onClick={() => router.push(`/appointments/${relationId}`)}>Back</HairlineButton>
            <button type="button" onClick={() => setStage("no_wallet")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
              I don&rsquo;t have the NDI wallet
            </button>
            <button type="button" onClick={() => start("declined")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
              Show what happens if you decline in the wallet
            </button>
            <button type="button" onClick={() => start("someone_else")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
              Show what happens if someone else&rsquo;s wallet answers
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
