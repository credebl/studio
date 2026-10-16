"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import type { OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { OnboardingShell } from "./OnboardingShell";
import { ORG_KINDS, kindOf } from "./orgKinds";

/**
 * SCR-ORG-01 — What kind of organisation. FLOW-ORG-01 step 1.
 *
 * THE TYPE DECIDES WHO IS ASKED
 *
 * Each type is verified by the authority that registered it, so the type
 * comes first and the authority is named on every row: the person should
 * know who will ask about them before anyone does.
 *
 * UNSUPPORTED TYPES ARE SHOWN, DISABLED, WITH THE REASON
 *
 * A type whose authority is not connected is still listed (UXD-11),
 * disabled, with the reason and the authority named, and with the one thing
 * that can be done about it: say you're waiting (SCR-ORG-06). NDI does not
 * decide who represents an organisation, so there is no route to a review.
 *
 * Why a type is unsupported has four possible causes on the server (P3) and
 * one message on the screen. Which cause applies is an authority's
 * configuration, not the applicant's business.
 *
 * NONE SUPPORTED
 *
 * On day zero no authority has been connected, so no type can be verified.
 * That used to read "nobody is in place yet to review an organisation" —
 * NDI as the gate. It now says what is actually missing: the authorities.
 */
type Face = "live" | "none_supported" | "no_permission";

export function OrgKindView() {
  const router = useRouter();
  const { startOrgOnboarding, orgOnboarding, organizations, people, connectedKinds, hydrated } = useDemo();
  const forced = useScreenState("SCR-ORG-01", ["live", "none_supported", "no_permission"]) as Face;

  /* An invitation or an existing organisation (Kind E) that started this is
     carried through a change of type — but not into a fresh start after a
     verification that already finished or was refused. */
  const carried = orgOnboarding?.stage === "started" ? orgOnboarding : null;
  const existing = carried?.existingOrgId ? organizations.find((o) => o.id === carried.existingOrgId) : undefined;
  const connected = forced === "none_supported" ? [] : connectedKinds;
  const [kind, setKind] = useState<OrgKind>(
    carried && connectedKinds.includes(carried.kind) ? carried.kind : "company",
  );
  const chosen = kindOf(kind);

  const start = (k: OrgKind) => startOrgOnboarding(k, carried?.invitationId, carried?.existingOrgId);
  const cancel = () => router.push(existing ? "/entity-wallet" : "/welcome");

  if (!hydrated) {
    return (
      <OnboardingShell current={0}>
        <div aria-hidden="true" className="h-72 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  if (forced === "no_permission") {
    /* Kind E needs the organisation's owner. Named, so the person knows
       whom to ask rather than only that they can't. */
    const owner = people.find((p) => p.id === "yeshey");
    return (
      <OnboardingShell current={0}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="font-display text-[15px] font-semibold text-strong">
              Only {existing?.name ?? "Bank of Bhutan"}&rsquo;s owner can verify it
            </p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              Ask {owner?.name ?? "its owner"} to start this. Nothing has changed.
            </p>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  if (connected.length === 0) {
    return (
      <OnboardingShell current={0}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="font-display text-[15px] font-semibold text-strong">
              Organisations can&rsquo;t be verified yet
            </p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              We check an organisation with the authority that registered it, and none is connected
              to the platform yet. Your account is ready — tell us you&rsquo;re waiting and
              we&rsquo;ll let you know when yours is.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <GradientButton
                onClick={() => {
                  start("company");
                  router.push("/onboarding/not-supported");
                }}
              >
                Tell us you&rsquo;re waiting
              </GradientButton>
              <HairlineButton onClick={cancel}>Leave</HairlineButton>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell current={0}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          {existing ? `What kind of organisation is ${existing.name}?` : "What kind of organisation is it?"}
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          We check it with the authority that registered it. Whether you represent it is that
          authority&rsquo;s decision, not ours.
        </p>
      </div>

      <Panel>
        <fieldset className="relative z-[4] m-0 flex flex-col gap-2 border-0 p-0">
          <legend className={`${LABEL_CLASS} mb-2 p-0`}>Type of organisation</legend>
          {ORG_KINDS.map((option) => {
            const supported = connected.includes(option.value);
            const on = supported && kind === option.value;
            return (
              <div
                key={option.value}
                className="flex flex-wrap items-start gap-3 rounded-[11px] border px-3.5 py-3"
                style={{
                  borderColor: on ? "var(--ndi-mint-40)" : "var(--border-grid)",
                  background: on ? "var(--ndi-mint-08)" : "transparent",
                }}
              >
                <label className={`flex min-w-0 flex-1 items-start gap-3 ${supported ? "cursor-pointer" : "cursor-not-allowed"}`}>
                  <input
                    type="radio"
                    name="org-kind"
                    checked={on}
                    disabled={!supported}
                    onChange={() => setKind(option.value)}
                    aria-describedby={`kind-${option.value}-why`}
                    className="mt-0.5 h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={`font-display text-[13.5px] font-medium ${supported ? "text-body" : "text-muted"}`}>
                      {option.label}
                    </span>
                    <span id={`kind-${option.value}-why`} className="text-[12.5px] leading-[1.5] text-faint">
                      {supported
                        ? `Verified with the ${option.authority}`
                        : `Can't be verified yet — the ${option.authority} isn't connected to the platform`}
                    </span>
                  </span>
                </label>
                {supported ? null : (
                  <span className="flex flex-wrap items-center gap-2.5 pl-7 min-[521px]:pl-0">
                    <StatusPill status="not_supported" label="Not yet" />
                    <button
                      type="button"
                      onClick={() => {
                        start(option.value);
                        router.push("/onboarding/not-supported");
                      }}
                      className="ndi-plainlink text-[12.5px] font-medium text-accent"
                    >
                      Tell us you&rsquo;re waiting
                    </button>
                  </span>
                )}
              </div>
            );
          })}
        </fieldset>
      </Panel>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <GradientButton
            onClick={() => {
              start(kind);
              router.push("/onboarding/details");
            }}
          >
            Continue
            <Icon name="arrowRight" size={15} strokeWidth={2} />
          </GradientButton>
          <HairlineButton onClick={cancel}>Cancel</HairlineButton>
        </div>
        <p className="max-w-[64ch] text-[12.5px] leading-[1.5] text-faint">
          Next you&rsquo;ll enter its {chosen.identifierLabel?.toLowerCase() ?? "registration number"}. Then the{" "}
          {chosen.authority} asks your NDI wallet who you are, and checks its own records.
        </p>
      </div>
    </OnboardingShell>
  );
}
