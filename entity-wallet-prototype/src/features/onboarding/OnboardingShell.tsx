"use client";

import type { ReactNode } from "react";

import { Lockup } from "@/components/layout/Lockup";
import { Stepper } from "@/components/ui/Stepper";

/**
 * The chrome for onboarding, which deliberately is not the app shell.
 *
 * There is no sidebar and no organisation switcher, because at this point
 * there is no organisation — the whole purpose of these screens is to bring
 * one into existence, and none exists until the authority has decided
 * (EW-FLOW2-SD/D10). Showing the workspace chrome around them would promise
 * a tenant that does not exist yet.
 *
 * The steps are FLOW-ORG-01's order: the type, the one identifier, the
 * authority's identity request answered from the person's wallet, and the
 * wait while the authority decides. The identifier comes before the proof
 * because the authority is asked about one pair — this person, this
 * registration — and the request it raises names what it is asking about.
 */
/* Short on purpose: four steps share a 900px column, and longer labels
   ellipsised at every width — a stepper you cannot read is decoration. */
export const ONBOARDING_STEPS = [
  { label: "Type" },
  { label: "Registration" },
  { label: "Your identity" },
  { label: "Verifying" },
];

export function OnboardingShell({
  current,
  children,
}: {
  current: number;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-subtle">
        <div className="mx-auto flex w-full max-w-[900px] items-center justify-between gap-4 px-4 py-4 min-[641px]:px-6">
          <Lockup className="block h-7 w-auto" />
          <span className="text-[12px] text-faint">Verifying an organisation</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[900px] flex-1 flex-col gap-6 px-4 py-6 min-[641px]:px-6 min-[901px]:py-10">
        <Stepper steps={ONBOARDING_STEPS} current={current} />
        {children}
      </main>
    </div>
  );
}
