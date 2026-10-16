"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { REGISTER_CHECK_MS, ROUND_TRIP_MS } from "@/lib/demoTiming";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * SCR-ORG-04 — Verifying. FLOW-ORG-01 steps 7–10.
 *
 * WAITING, REFUSED AND ALMOST-DONE ARE THREE DIFFERENT THINGS
 *
 * The wait spans the authority's systems and then the setting-up of the
 * organisation's wallet, which runs in minutes. One spinner would collapse
 * three outcomes into "it didn't work": the authority not answering (E8,
 * no decision made), the authority approving and setup not finishing (E9,
 * E10 — a favourable decision the platform has not finished acting on), and
 * a refusal (E6/E7, its own screen). So each step is named in the person's
 * terms with the authority named at its step, and each failure says which
 * kind it is. E8 says nothing is wrong with the application; E9 and E10
 * lead with the approval, because the fear at this point is rejection.
 *
 * THE PAGE CAN BE CLOSED
 *
 * No organisation exists until the authority decides (EW-FLOW2-SD/D10), so
 * closing this page leaves nothing on the dashboard to come back to — which
 * is why SCR-ONB-05 carries the application while it is in flight and
 * routes back here. Coming back shows the state the application is
 * actually in, never a fresh start: the stage lives in the store, and this
 * screen picks up from it.
 *
 * THE DECISION IS THE STORE'S
 *
 * The screen waits and then asks the store, standing in for the authority,
 * what it decided. It never works the answer out itself.
 *
 * Success goes to the organisation's verified screen. In FLOW-DEL-02 it goes
 * first to accepting responsibility (SCR-DEL-01); that is Flow 3's screen.
 */
type Face = "checking" | "setting_up" | "unreachable" | "setup_failed" | "issuing_failed";

export function VerifyingView() {
  const router = useRouter();
  const { orgOnboarding, signup, currentPerson, checkWithAuthority, completeOrgOnboarding, setVerificationNotify, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ORG-04", [
    "live",
    "checking",
    "setting_up",
    "unreachable",
    "setup_failed",
    "issuing_failed",
    "resumed",
  ]);

  const kind = kindOf(orgOnboarding?.kind);
  const authority = `the ${kind.authority}`;
  const Authority = `The ${kind.authority}`;
  const stage = orgOnboarding?.stage;
  const email = (signup?.stage === "done" ? signup.email : "") || currentPerson.email;

  /* A local fault on top of the stored stage: E8 leaves the record where it
     was (inconclusive, not a refusal), E9/E10 leave it setting up. */
  const [fault, setFault] = useState<"unreachable" | "setup_failed" | null>(null);
  const [resumed, setResumed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    /* Reached from SCR-ONB-05's "Check progress". Read once, without
       useSearchParams, so the page needs no suspense boundary for a flag. */
    setResumed(new URLSearchParams(window.location.search).has("resumed"));
  }, []);

  useEffect(() => {
    if (forced !== "live" || fault) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (stage === "checking") {
      timers.current.push(
        setTimeout(() => {
          if (checkWithAuthority() === "not_confirmed") router.push("/onboarding/not-verified");
        }, REGISTER_CHECK_MS),
      );
    } else if (stage === "setting_up") {
      timers.current.push(
        setTimeout(() => {
          completeOrgOnboarding();
          router.push("/onboarding/foundational");
        }, ROUND_TRIP_MS * 2),
      );
    }
    return () => timers.current.forEach(clearTimeout);
    // Re-run when the stage moves, or on a retry.
  }, [stage, fault, attempt, forced]);

  const face: Face =
    forced !== "live" && forced !== "resumed"
      ? (forced as Face)
      : fault === "unreachable"
        ? "unreachable"
        : fault === "setup_failed"
          ? "setup_failed"
          : stage === "setting_up"
            ? "setting_up"
            : "checking";
  const showResumed = forced === "resumed" || resumed;

  if (!hydrated) {
    return (
      <OnboardingShell current={3}>
        <div aria-hidden="true" className="h-72 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  if (forced === "live" && stage !== "checking" && stage !== "setting_up") {
    return (
      <OnboardingShell current={3}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">Nothing is being verified</p>
            <p className="text-[13px] leading-[1.6] text-muted">
              {stage === "verified"
                ? "This organisation is already verified."
                : "There's no application in progress for this account."}
            </p>
            <div>
              <Link href={stage === "verified" ? "/onboarding/foundational" : "/onboarding"}>
                <GradientButton>{stage === "verified" ? "See the organisation" : "Verify an organisation"}</GradientButton>
              </Link>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  const notify = orgOnboarding?.notify ?? false;
  const approved = face === "setting_up" || face === "setup_failed" || face === "issuing_failed";
  const retry = () => {
    setFault(null);
    setAttempt((n) => n + 1);
  };

  return (
    <OnboardingShell current={3}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          Verifying <span className="font-mono text-[22px]">{orgOnboarding?.identifier ?? kind.example}</span>
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          You can close this page — it carries on without you, and your account shows where it&rsquo;s
          up to.
        </p>
      </div>

      {showResumed ? (
        <p role="status" className="m-0 flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
          <Icon name="info" size={14} strokeWidth={2} className="flex-none text-faint" />
          Welcome back. This is where your application is now — nothing started again.
        </p>
      ) : null}

      {face === "unreachable" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="alert">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 font-display text-[15px] font-semibold text-strong">We couldn&rsquo;t reach {authority}</p>
              <StatusPill status="pending" label="Not decided" />
            </div>
            <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-body">
              We couldn&rsquo;t reach {authority} just now. Nothing is wrong with your application — try
              again shortly.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <HairlineButton onClick={retry}>
                <Icon name="refresh" size={14} strokeWidth={2} />
                Try again
              </HairlineButton>
              <NotifyToggle on={notify} email={email} onChange={setVerificationNotify} />
            </div>
          </div>
        </Panel>
      ) : null}

      {face === "setup_failed" || face === "issuing_failed" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="m-0 font-display text-[15px] font-semibold text-strong">
                {face === "issuing_failed" ? "Almost there" : "Approved — still setting up"}
              </p>
              <StatusPill status="approved" label="Approved" />
            </div>
            <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-body">
              {face === "issuing_failed"
                ? `Almost there — ${authority} has approved your organisation and we're issuing its credential.`
                : `${Authority} has approved your organisation. We're still setting up its wallet — this can take a few minutes.`}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <HairlineButton onClick={retry}>
                <Icon name="refresh" size={14} strokeWidth={2} />
                Try again
              </HairlineButton>
              <NotifyToggle on={notify} email={email} onChange={setVerificationNotify} />
              <button type="button" onClick={() => router.push("/welcome")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                Close this page
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <ol className="relative z-[4] m-0 flex list-none flex-col gap-4 p-0" aria-live="polite">
          <Step
            label={approved ? `${Authority} has approved your organisation` : `${Authority} is checking its records`}
            detail={
              approved
                ? "Its records show you as a representative. That was its decision."
                : face === "unreachable"
                  ? "No answer yet — no decision has been made."
                  : `Whether its records show you as a representative of this registration. Usually under a minute.`
            }
            state={approved ? "done" : face === "unreachable" ? "paused" : "active"}
          />
          <Step
            label="Setting up your organisation's wallet"
            detail="Its wallet is created and its registration added to it. This takes a few minutes."
            state={face === "setting_up" ? "active" : approved ? "paused" : "waiting"}
          />
        </ol>
      </Panel>

      {face === "checking" || face === "setting_up" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <HairlineButton onClick={() => router.push("/welcome")}>Close this page</HairlineButton>
            <NotifyToggle on={notify} email={email} onChange={setVerificationNotify} />
          </div>
          <p className="m-0 text-[12px] leading-[1.5] text-faint">
            Prototype — the minutes are compressed to seconds.
          </p>
          {/* Walkable, not only in the switcher: what a slow authority and a
              stalled setup look like is asked for in every walk-through. */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {face === "checking" ? (
              <button type="button" onClick={() => setFault("unreachable")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
                Show what happens if {authority} can&rsquo;t be reached
              </button>
            ) : (
              <button type="button" onClick={() => setFault("setup_failed")} className="ndi-plainlink text-[12.5px] font-medium text-faint">
                Show what happens if setting up stalls
              </button>
            )}
          </div>
        </div>
      ) : null}
    </OnboardingShell>
  );
}

function NotifyToggle({ on, email, onChange }: { on: boolean; email: string; onChange: (on: boolean) => void }) {
  return on ? (
    <span role="status" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
      <Icon name="check" size={13} strokeWidth={2.4} className="text-accent" />
      We&rsquo;ll email {email} when it&rsquo;s done
      <button type="button" onClick={() => onChange(false)} className="ndi-plainlink ml-1 font-medium text-faint">
        Undo
      </button>
    </span>
  ) : (
    <button type="button" onClick={() => onChange(true)} className="ndi-plainlink inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent">
      <Icon name="mail" size={13} strokeWidth={2} />
      Email me when it&rsquo;s done
    </button>
  );
}

function Step({ label, detail, state }: { label: string; detail: string; state: "waiting" | "active" | "done" | "paused" }) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border"
        style={{
          borderColor: state === "waiting" ? "var(--border-grid)" : "var(--ndi-mint-40)",
          background: state === "waiting" ? "transparent" : "var(--ndi-mint-12)",
        }}
      >
        {state === "active" ? (
          <Icon name="refresh" size={12} strokeWidth={2.4} className="animate-spin text-accent" />
        ) : state === "done" ? (
          <Icon name="check" size={12} strokeWidth={3} className="text-accent" />
        ) : state === "paused" ? (
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ndi-warning)" }} />
        ) : null}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-display text-[13.5px] font-medium leading-[1.4]" style={{ color: state === "waiting" ? "var(--text-faint)" : "var(--text-body)" }}>
          {label}
          <span className="sr-only">
            {state === "active" ? " — in progress" : state === "done" ? " — done" : state === "paused" ? " — waiting to retry" : " — not started"}
          </span>
        </span>
        <span className="text-[12.5px] leading-[1.5] text-faint">{detail}</span>
      </span>
    </li>
  );
}
