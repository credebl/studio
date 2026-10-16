"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AccountShell } from "@/components/layout/AccountShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/** Where Flow 2 — adding an organisation — begins. */
export const ADD_ORGANISATION_ROUTE = "/onboarding";

/**
 * SCR-ONB-05 — You're in, what next. FLOW-ONB-01 step 8.
 *
 * THE SCREEN THAT SAYS THE QUIET PART
 *
 * A new account can do nothing: no organisation, no wallet, no DID (Q3). The
 * most likely failure here is not an error at all — it is a person reaching
 * a screen that looks like a product, concluding they have finished, and
 * leaving (UC-04). So the empty state is one card that says what the account
 * is, what it cannot do yet, and the single thing to do next (UXD-01).
 *
 * ONE ORGANISATION IS STILL A LIST
 *
 * People in Bhutan commonly run more than one business, and accountants act
 * for several (UXD-08). Once the account belongs to anything, this becomes a
 * list — and a list of one renders as a list, not as a special case, so the
 * person who adds a second business next month finds the same screen with
 * one more row. "Add another organisation" is always there, never buried.
 */
export function WelcomeView() {
  const router = useRouter();
  const { signup, organizations, setPersona, setActiveOrg, hydrated } = useDemo();

  const forced = useScreenState("SCR-ONB-05", [
    "live",
    "loading",
    "empty",
    "populated",
    "error",
    "offline",
  ]);

  const account = signup?.stage === "done" ? signup : null;
  const memberships = account?.memberships ?? [];
  const rows = memberships
    .map((m) => ({ ...m, org: organizations.find((o) => o.id === m.orgId) }))
    .filter((r) => r.org);

  /* Root is not here. NDI's root administrator never makes an account — the
     deployment made it — so they sign in and land in NDI's organisation
     (see ROOT_ADMIN). This screen is only ever for someone who has just
     signed up and belongs to nothing, or to the organisations listed. */
  const state =
    forced !== "live"
      ? forced
      : !hydrated
        ? "loading"
        : !account
          ? "no_account"
          : rows.length === 0
            ? "empty"
            : "populated";

  /* The populated face needs a row to show even when forced from an empty
     account, or the state switcher would review an empty list. */
  const shownRows =
    rows.length > 0
      ? rows
      : [{ orgId: "org-pelden", role: "Owner" as const, org: organizations.find((o) => o.id === "org-pelden") }];

  const open = (orgId: string) => {
    /* The prototype's personas stand in for accounts once they are acting
       for an organisation: the owner of Pelden Trading is Dorji. The real
       product would carry the account itself into the console. */
    setActiveOrg(orgId);
    setPersona("dorji");
    router.push("/dashboard");
  };

  return (
    <AccountShell name={account?.name || undefined}>
      {state === "loading" ? (
        /* A skeleton shaped like what is coming — the single card for an
           account with nothing, which is what a new account always is. */
        <div aria-hidden="true" className="h-[260px] animate-pulse rounded-[16px] border border-grid bg-[rgb(var(--tint)/0.03)]" />
      ) : null}

      {state === "no_account" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h1 className="font-display text-[22px] font-semibold text-strong">
              You&rsquo;re not signed in
            </h1>
            <p className="text-[13.5px] leading-[1.6] text-muted">
              There&rsquo;s no account in this browser yet.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href="/sign-up">
                <GradientButton>Create an account</GradientButton>
              </Link>
              <Link href="/sign-in">
                <HairlineButton>Sign in</HairlineButton>
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

      {state === "error" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="alert">
            <h1 className="font-display text-[22px] font-semibold text-strong">
              We couldn&rsquo;t load your details
            </h1>
            <p className="text-[13.5px] leading-[1.6] text-muted">
              Your account exists and nothing has been lost — we just couldn&rsquo;t fetch it
              right now.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <GradientButton onClick={() => router.refresh()}>Try again</GradientButton>
              <Link href="/sign-in">
                <HairlineButton>Sign out</HairlineButton>
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

      {state === "empty" || state === "offline" ? (
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
                Your account is ready
              </h1>
              <p className="max-w-[56ch] text-[14.5px] leading-[1.65] text-body">
                There&rsquo;s nothing here yet. To use the platform, add the organisation you act
                for — we&rsquo;ll check its registration and set it up.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div>
                <GradientButton
                  onClick={() => router.push(ADD_ORGANISATION_ROUTE)}
                  disabled={state === "offline"}
                >
                  <Icon name="building" size={15} strokeWidth={2} />
                  Add your organisation
                </GradientButton>
              </div>
              {state === "offline" ? (
                <p className="text-[12.5px] leading-[1.5] text-faint" role="status">
                  You&rsquo;re offline, so an organisation can&rsquo;t be added right now. Nothing
                  on this page needs you to act until you&rsquo;re back online.
                </p>
              ) : null}
            </div>

            <p className="max-w-[60ch] border-t border-subtle pt-4 text-[12.5px] leading-[1.55] text-faint">
              If you&rsquo;re expecting an invitation from someone else, you don&rsquo;t need to
              do this — ask them to resend it.
            </p>
          </div>
        </Panel>
      ) : null}

      {state === "populated" ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-strong">
              Your organisations
            </h1>
            <p className="text-[13.5px] leading-[1.6] text-muted">
              Choose the one you&rsquo;re acting for. You can switch at any time — the one
              you&rsquo;re in is always named at the top of the screen.
            </p>
          </div>

          <Panel padded={false}>
            <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
              {shownRows.map((row, i) => (
                <li
                  key={row.orgId}
                  className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${
                    i > 0 ? "border-t border-subtle" : ""
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-grid"
                      style={{ background: "var(--ndi-mint-08)" }}
                    >
                      <Icon name="building" size={16} strokeWidth={1.8} className="text-accent" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-display text-[14.5px] font-semibold text-strong">
                        {row.org?.name}
                      </span>
                      <span className="text-[12.5px] text-faint">Your role: {row.role}</span>
                    </span>
                  </span>
                  <GradientButton onClick={() => open(row.orgId)}>
                    Open
                    <Icon name="arrowRight" size={14} strokeWidth={2} />
                  </GradientButton>
                </li>
              ))}
            </ul>
          </Panel>

          <div>
            <HairlineButton onClick={() => router.push(ADD_ORGANISATION_ROUTE)}>
              <Icon name="plus" size={14} strokeWidth={2} />
              Add another organisation
            </HairlineButton>
          </div>
        </div>
      ) : null}
    </AccountShell>
  );
}
