"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * SCR-ORG-06 — Not supported yet. FLOW-ORG-01 E1.
 *
 * REFUSED BEFORE ANYTHING IS ENTERED
 *
 * The person reaches this from the type alone, before any registration
 * number is typed, and none is asked for here: the interest kept is the
 * type and an address (S9). Nothing has been verified and no organisation
 * exists, so keeping a business identifier for one the platform cannot
 * serve would be collection without a purpose.
 *
 * NOTHING IS PENDING, AND THE SCREEN SAYS SO
 *
 * The confirmation is the riskiest line here. Someone who believes they are
 * in a queue waits for something that is not coming (UN-15), so it says in
 * as many words that there is no application.
 *
 * This replaced the route where a type with no register went to a review by
 * NDI. NDI does not decide who represents an organisation, with or without
 * a register to ask.
 */
export function NotSupportedView() {
  const router = useRouter();
  const { orgOnboarding, signup, currentPerson, orgInterests, recordOrgInterest, connectedKinds, hydrated } = useDemo();
  const forced = useScreenState("SCR-ORG-06", ["live", "default", "interest_recorded"]);

  const kind = kindOf(orgOnboarding?.kind);
  /* With nothing connected at all (day zero), the authority is not one
     but any — so the copy names the general case instead of a register. */
  const noneConnected = connectedKinds.length === 0;
  const email = (signup?.stage === "done" ? signup.email : "") || currentPerson.email;
  const recorded = orgInterests.some((i) => i.kind === kind.value && i.email === email);
  const [busy, setBusy] = useState(false);

  const face = forced === "live" ? (recorded ? "interest_recorded" : "default") : forced;

  if (!hydrated) {
    return (
      <OnboardingShell current={0}>
        <div aria-hidden="true" className="h-56 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell current={0}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          {face === "interest_recorded" ? "We'll let you know" : "We can't verify this type of organisation yet"}
        </h1>
      </div>

      {face === "interest_recorded" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="flex items-center gap-2.5 font-display text-[14.5px] font-semibold text-strong">
              <Icon name="check" size={16} strokeWidth={2.4} className="text-accent" />
              Noted that you&rsquo;re waiting
            </p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              Nothing is pending. There&rsquo;s no application and no organisation on the platform —
              only a note that you&rsquo;d like to know. We&rsquo;ll email {email} when{" "}
              {noneConnected ? "an authority" : `the ${kind.authority}`} is connected, and
              you&rsquo;ll start from the beginning then.
            </p>
            <div>
              <HairlineButton onClick={() => router.push("/welcome")}>Leave</HairlineButton>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p className="max-w-[64ch] text-[14px] leading-[1.65] text-body">
              {noneConnected
                ? "We check an organisation with the authority that registered it, and no authority is connected to the platform yet."
                : `We can't verify this type of organisation yet. We check with the authority that registered you, and the ${kind.authority} isn't connected to the platform yet.`}
            </p>
            <p className="max-w-[64ch] text-[13px] leading-[1.6] text-muted">
              That changes when {noneConnected ? "an authority" : "it"} is connected — not by anything
              you or we decide. Tell us you&rsquo;re waiting and we&rsquo;ll email you. We
              won&rsquo;t keep anything about your organisation.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
              <GradientButton
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  window.setTimeout(() => {
                    recordOrgInterest(kind.value, email);
                    setBusy(false);
                  }, LOCAL_MS);
                }}
              >
                {busy ? "Saving…" : "Tell us you're waiting"}
              </GradientButton>
              {noneConnected ? null : (
                <HairlineButton onClick={() => router.push("/onboarding")}>Choose a different type</HairlineButton>
              )}
              <button type="button" onClick={() => router.push("/welcome")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
                Leave
              </button>
            </div>
          </div>
        </Panel>
      )}
    </OnboardingShell>
  );
}
