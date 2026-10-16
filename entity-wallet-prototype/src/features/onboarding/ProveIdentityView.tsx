"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff, type HandoffStatus } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { useReveal } from "@/components/ui/useReveal";
import type { PersonId } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { AUTO_ADVANCE_MS, SKIP_AFTER_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * SCR-ORG-03 — Check your NDI wallet. FLOW-ORG-01 steps 5–6.
 *
 * THE AUTHORITY ASKS, AND IS NAMED
 *
 * The identity request is raised by the authority, not by NDI (S2), and
 * this screen names it in the same words the wallet prompt will: "The
 * Corporate Regulatory Authority is asking who you are." If the page said
 * NDI and the phone said the CRA, people would learn that mismatched
 * prompts are normal — the habit phishing relies on (UC-09). The copy used
 * to say the wallet "tells us who you are" and that the citizenship number
 * went "to the platform"; neither was true. NDI keeps nothing from this
 * proof — the authority checks it against its own records.
 *
 * ONLY IDENTITY, AND SAID SO
 *
 * What is shared is listed, and so is what is not: nothing about the
 * organisation leaves the wallet, because the wallet holds nothing about it.
 *
 * EVERY WAY IT CAN END
 *
 * Declined and expired (E4) say nothing was set up. A rejected identity
 * credential (E5) sends the person to their wallet, not to NDI support. No
 * wallet at all (E11) is an honest dead end. On a phone (same device) the
 * code becomes a link to open the wallet.
 *
 * WHERE PROXY SIGN-UP IS CAUGHT
 *
 * Sign-up cannot tell a director from their accountant typing (UXD-09).
 * If the wallet that answers belongs to someone other than the account
 * holder, it stops here, with the proof in hand and before the authority
 * is asked anything. Walkable, because "what if someone else signed up for
 * them?" is the question the room asks.
 */
type Stage =
  | "idle"
  | "wallet"
  | "proved"
  | "declined"
  | "expired"
  | "credential_rejected"
  | "no_wallet"
  | "mismatch";

export function ProveIdentityView() {
  const router = useRouter();
  const { signup, orgOnboarding, orgInvitations, people, currentPerson, recordIdentityProof, hydrated } = useDemo();

  const screenState = useScreenState("SCR-ORG-03", [
    "live",
    "waiting",
    "waiting_for_wallet",
    "same_device",
    "proved",
    "declined",
    "expired",
    "credential_rejected",
    "no_wallet",
    "name_mismatch",
  ]);

  const [stage, setStage] = useState<Stage>("idle");
  const [skippable, setSkippable] = useState(false);
  const [guidance, setGuidance] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const kind = kindOf(orgOnboarding?.kind);
  const accountName = signup?.stage === "done" ? signup.name : null;

  /* Who the wallet answers as. The prototype has no phone, so it answers as
     the person the story puts here: the invitee an invitation was sent to;
     the owner verifying an organisation already on the platform (Kind E);
     otherwise Dorji, under the name the account was given. The mismatch
     path answers as somebody else on purpose. */
  const invitation = orgInvitations.find((i) => i.id === orgOnboarding?.invitationId);
  const invitee = invitation ? people.find((p) => p.email.toLowerCase() === invitation.email.toLowerCase()) : undefined;
  const answerer: { id: PersonId; name: string } = orgOnboarding?.existingOrgId
    ? { id: currentPerson.id, name: currentPerson.name }
    : invitee
      ? { id: invitee.id, name: invitee.name }
      : { id: "dorji", name: accountName || "Dorji Wangchuk" };

  const prove = () => recordIdentityProof(answerer.name, answerer.id);

  const start = (outcome: "proved" | "mismatch" | "declined") => {
    setSkippable(false);
    setStage("wallet");
    timers.current.push(setTimeout(() => setSkippable(true), SKIP_AFTER_MS));
    timers.current.push(
      setTimeout(() => {
        setStage(outcome);
        if (outcome === "proved") prove();
      }, WALLET_HANDOFF_MS),
    );
  };

  const forced: Stage | "same_device" | null =
    screenState === "live" || screenState === "waiting"
      ? null
      : screenState === "waiting_for_wallet"
        ? "wallet"
        : screenState === "name_mismatch"
          ? "mismatch"
          : (screenState as Stage | "same_device");
  const sameDevice = forced === "same_device";
  const shown: Stage = forced && forced !== "same_device" ? forced : stage;

  /* Once the proof is in, move on by itself after a beat. Only for a proof
     that really happened: the switcher's "proved" is for reviewing this
     screen, and a screen that leaves the moment you ask to see it cannot be
     reviewed. The confirmation sits above the card, under the heading, so
     it is on screen from the moment it appears. */
  const provedRef = useReveal<HTMLDivElement>(shown === "proved");
  const outcomeRef = useReveal<HTMLDivElement>(
    shown === "mismatch" || shown === "declined" || shown === "credential_rejected" || shown === "no_wallet",
  );
  useEffect(() => {
    if (stage !== "proved" || forced) return;
    const t = setTimeout(() => router.push("/onboarding/verifying"), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [stage, forced, router]);

  if (!hydrated) {
    return (
      <OnboardingShell current={2}>
        <div aria-hidden="true" className="h-72 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  /* Arrived without a registration to ask about — by URL, or after the
     request was already answered. Sent to where the application actually
     is, never asked to prove anything twice. */
  if (screenState === "live" && stage === "idle" && orgOnboarding?.stage !== "proof_requested") {
    const later = orgOnboarding && ["checking", "setting_up"].includes(orgOnboarding.stage);
    return (
      <OnboardingShell current={2}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">
              {later ? "You've already answered this request" : "Enter the registration first"}
            </p>
            <p className="text-[13px] leading-[1.6] text-muted">
              {later
                ? `The ${kind.authority} is checking its records.`
                : "The authority's request names the registration it is asking about, so that comes first."}
            </p>
            <div>
              <Link href={later ? "/onboarding/verifying" : "/onboarding/details"}>
                <GradientButton>{later ? "Check progress" : "Enter the registration"}</GradientButton>
              </Link>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  const handoffStatus: HandoffStatus =
    shown === "idle"
      ? "awaiting_scan"
      : shown === "wallet"
        ? "waiting"
        : shown === "proved"
          ? "confirmed"
          : shown === "expired"
            ? "expired"
            : "failed";

  const outcome = (title: string, body: React.ReactNode, actions: React.ReactNode) => (
    <div ref={outcomeRef}>
      <Panel>
        <div className="relative z-[4] flex items-start gap-3" role="alert">
          <Icon name="close" size={18} strokeWidth={2.2} className="mt-0.5 flex-none" style={{ color: "var(--ndi-danger)" }} />
          <div className="flex flex-col gap-2">
            <p className="font-display text-[14.5px] font-semibold text-strong">{title}</p>
            <div className="flex max-w-[62ch] flex-col gap-2 text-[13px] leading-[1.6] text-muted">{body}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">{actions}</div>
          </div>
        </div>
      </Panel>
    </div>
  );

  const tryAgain = (
    <HairlineButton onClick={() => setStage("idle")}>
      <Icon name="refresh" size={14} strokeWidth={2} />
      Try again
    </HairlineButton>
  );

  return (
    <OnboardingShell current={2}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          Check your NDI wallet
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          The {kind.authority} is asking who you are, so it can check its own records for{" "}
          <span className="font-mono text-body">{orgOnboarding?.identifier ?? kind.example}</span>. Answer the
          request in your wallet — on your phone, or on another device.
        </p>
      </div>

      {shown === "proved" ? (
        <div ref={provedRef}>
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    You&rsquo;ve answered the {kind.authority}&rsquo;s request
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    Next, it checks its records to see whether they show {answerer.name} as a
                    representative.
                  </p>
                </div>
              </div>
              <p role="status" className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 pl-[30px] text-[12.5px] text-faint">
                {/* No button: once the proof is in there is nothing for the
                    person to decide, so the screen confirms it and moves on
                    by itself. A "Continue" here only asked for a click that
                    changed nothing. */}
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border-grid)] border-t-[var(--accent)]" />
                  {forced ? "Moves on to the next step by itself" : "Taking you to the next step…"}
                </span>
              </p>
            </div>
          </Panel>
        </div>
      ) : null}

      {shown === "declined"
        ? outcome(
            "You didn't approve the request",
            <p className="m-0">
              You didn&rsquo;t approve the identity request, so we couldn&rsquo;t continue. Nothing has
              been set up — you can start again whenever you&rsquo;re ready.
            </p>,
            <HairlineButton onClick={() => router.push("/onboarding/details")}>
              <Icon name="refresh" size={14} strokeWidth={2} />
              Try again
            </HairlineButton>,
          )
        : null}

      {shown === "credential_rejected"
        ? outcome(
            "Your identity credential couldn't be accepted",
            <>
              <p className="m-0">
                The {kind.authority} couldn&rsquo;t accept your identity credential. Check it in your
                NDI wallet before trying again.
              </p>
              {guidance ? (
                <p role="status" className="m-0 text-faint">
                  In the wallet, open your citizen credential: if it shows as expired or revoked,
                  renew it with the Department of Civil Registration and Census, then try again.
                </p>
              ) : null}
            </>,
            <>
              <HairlineButton onClick={() => setGuidance(true)}>What to check in the wallet</HairlineButton>
              {tryAgain}
            </>,
          )
        : null}

      {shown === "no_wallet"
        ? outcome(
            "You'll need the NDI wallet",
            <>
              <p className="m-0">
                You&rsquo;ll need the NDI wallet app with your identity credential to verify an
                organisation.
              </p>
              {guidance ? (
                <p role="status" className="m-0 text-faint">
                  Bhutan NDI Wallet is on the App Store and Google Play. Setting it up adds your
                  identity credential. Come back here when it&rsquo;s on your phone.
                </p>
              ) : null}
            </>,
            <>
              <HairlineButton onClick={() => setGuidance(true)}>How to get the NDI wallet</HairlineButton>
              <button type="button" onClick={() => router.push("/welcome")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                Leave
              </button>
            </>,
          )
        : null}

      {shown === "mismatch"
        ? outcome(
            "This proof is for someone else",
            <>
              <p className="m-0">
                The wallet that answered belongs to Karma Dorji, but this account belongs to{" "}
                {accountName ?? answerer.name}. An organisation has to be verified by the person who
                represents it, from their own account.
              </p>
              <p className="m-0">
                If you were helping someone, they need their own account. Nothing has been set up,
                and the {kind.authority} wasn&rsquo;t asked anything.
              </p>
            </>,
            tryAgain,
          )
        : null}

      {shown !== "no_wallet" ? (
        <Panel>
          <WalletHandoff
            value="ndi-org-verification-proof"
            title={`The ${kind.authority} is asking who you are`}
            purpose={`It checks your identity against its own records for this registration. NDI doesn't see those records, and keeps nothing from this proof.`}
            sharing={["Your full name, as it is on your citizen credential", "Your citizenship ID number"]}
            notSharing={["Anything about the organisation", "Anything else in your wallet"]}
            sameDevice={sameDevice}
            status={handoffStatus}
            statusDetail={
              shown === "mismatch"
                ? "The identity you proved does not match the person this account belongs to."
                : shown === "declined"
                  ? "You declined in the wallet. Nothing was shared."
                  : shown === "credential_rejected"
                    ? "Your identity credential wasn't accepted. Nothing was checked."
                    : undefined
            }
            onRetry={shown === "expired" ? () => router.push("/onboarding/details") : undefined}
            onSimulateScan={() => start("proved")}
            onCancel={() => router.push("/onboarding/details")}
            onSkip={
              skippable && shown === "wallet"
                ? () => {
                    timers.current.forEach(clearTimeout);
                    setStage("proved");
                    prove();
                  }
                : undefined
            }
          />
        </Panel>
      ) : null}

      {shown === "idle" ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <HairlineButton onClick={() => router.push("/onboarding/details")}>Back</HairlineButton>
          <button
            type="button"
            onClick={() => {
              setGuidance(false);
              setStage("no_wallet");
            }}
            className="ndi-plainlink text-[12.5px] font-medium text-muted"
          >
            I don&rsquo;t have the NDI wallet
          </button>
          <button type="button" onClick={() => start("declined")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
            Show what happens if you decline in the wallet
          </button>
          <button type="button" onClick={() => start("mismatch")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
            Show what happens if someone else&rsquo;s wallet answers
          </button>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
