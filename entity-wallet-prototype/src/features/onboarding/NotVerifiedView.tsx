"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { useDemo } from "@/lib/demoStore";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * SCR-ORG-05 — Not verified. FLOW-ORG-01 E6 and E7.
 *
 * THE AUTHORITY'S DECISION, AND WHERE TO TAKE IT
 *
 * The person has just approved an identity request and been refused, and
 * the instinct is to read it as NDI rejecting them. It is not: NDI asked,
 * and the authority's records did not match. So the authority is named,
 * nothing implies NDI judged anything, and the primary action sends the
 * person to the authority — the only place a record can be corrected —
 * rather than to NDI support. The platform offers no override (E6).
 *
 * This replaced "ask NDI to review it instead", which made NDI a second
 * authority on who represents an organisation. It is not one.
 *
 * E6 AND E7 CANNOT BE TOLD APART
 *
 * "Your records don't show you" and "this registration isn't recognised"
 * would together tell someone guessing identifiers which ones exist (S6).
 * The record keeps no difference between them, so this screen has none to
 * show: the E7 face exists in the state switcher for review against the
 * specification's wording, and says the same thing in substance.
 */
export function NotVerifiedView() {
  const router = useRouter();
  const { orgOnboarding, organizations, startOrgOnboarding, hydrated } = useDemo();
  const forced = useScreenState("SCR-ORG-05", ["not_a_representative", "not_recognised"]);
  const [guidance, setGuidance] = useState(false);

  const kind = kindOf(orgOnboarding?.kind);
  const existing = orgOnboarding?.existingOrgId
    ? organizations.find((o) => o.id === orgOnboarding.existingOrgId)
    : undefined;
  /* No organisation name came back — the authority returns one only with
     an approval — so the registration is named as it was entered. */
  const subject = existing?.name ?? orgOnboarding?.identifier ?? kind.example ?? "this organisation";

  if (!hydrated) {
    return (
      <OnboardingShell current={3}>
        <div aria-hidden="true" className="h-56 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell current={3}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          The {kind.authority} didn&rsquo;t confirm this
        </h1>
      </div>

      <Panel>
        <div className="relative z-[4] flex flex-col gap-4" role="alert">
          <p className="m-0 max-w-[64ch] text-[14px] leading-[1.65] text-body">
            {forced === "not_recognised" ? (
              <>The {kind.authority} doesn&rsquo;t recognise this registration, or it&rsquo;s no longer active.</>
            ) : (
              <>
                The {kind.authority}&rsquo;s records don&rsquo;t show you as a representative of{" "}
                <span className={existing ? "" : "font-mono"}>{subject}</span>. We asked them; the decision is
                theirs. If their records are wrong, it has to be corrected with the {kind.authority}.
              </>
            )}
          </p>
          <p className="m-0 max-w-[64ch] text-[13px] leading-[1.6] text-muted">
            Nothing has been set up{existing ? `, and ${existing.name} is exactly as it was` : ""}.
          </p>

          {guidance ? (
            <div role="status" className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className="m-0 text-[13px] font-medium text-body">Correcting it with the {kind.authority}</p>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                Ask the {kind.authority} to check who its records show as representatives for this
                registration — usually directors or the proprietor. Once its records are updated, start
                again here; nothing needs to be cancelled first.
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
            <GradientButton onClick={() => setGuidance(true)}>How to correct this with the {kind.authority}</GradientButton>
            <HairlineButton
              onClick={() => {
                /* A fresh record — E6 ended the last one — keeping what
                   started it, so an existing organisation stays the subject. */
                startOrgOnboarding(kind.value, orgOnboarding?.invitationId, orgOnboarding?.existingOrgId);
                router.push("/onboarding");
              }}
            >
              {existing ? "Try again" : "Try a different organisation"}
            </HairlineButton>
            <button
              type="button"
              onClick={() => router.push(existing ? "/dashboard" : "/welcome")}
              className="ndi-plainlink text-[12.5px] font-medium text-muted"
            >
              Leave
            </button>
          </div>
        </div>
      </Panel>
    </OnboardingShell>
  );
}
