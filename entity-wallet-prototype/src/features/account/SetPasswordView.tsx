"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { PasswordScene } from "@/components/ui/scenes";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { AuthCardHeader, AuthNotice } from "@/features/auth/AuthCard";

import { AccountSetupForm } from "./AccountSetupForm";

/**
 * SCR-ONB-04 — Set your password. FLOW-ONB-01 step 6.
 *
 * The rules are on screen before the first character is typed and stay
 * neutral until the field is left, so typing is not greeted with four
 * failures. When one is missed, the message names that rule (E8) rather than
 * repeating the whole policy.
 *
 * THE FAILURE THAT IS NOT THE PERSON'S
 *
 * If the account cannot be created at step 7 (E5 — Keycloak unreachable),
 * nothing the person typed is lost: the verified email is still in the
 * session and the form keeps its values, so trying again creates one account
 * rather than two. The message says the work is safe before it says anything
 * else, because that is the first thing someone in that position wants to
 * know.
 *
 * ERRORS AT THE FIELD, AS ON THE INVITATION
 *
 * This screen used to send every miss — no name, a broken rule, passwords
 * that differ — to a banner at the top of the card. SCR-ONB-04 wants E8 "at
 * the field" (SC 3.3.1), and the invitation's set-up form already did it:
 * the message under the field, focus moved there. Sign-up is the main route
 * through Flow 1, so it now uses that same form rather than a second copy of
 * its fields and checks. Only E5, which no field caused, sits beside the
 * button.
 *
 * The password itself goes nowhere in this prototype. Not into the store,
 * not into localStorage — there is no reason for a demo to hold one, and
 * FLOW-ONB-01 §12 item 3 is specific that ordinary sign-up does not persist
 * it either.
 */
export function SetPasswordView() {
  const router = useRouter();
  const { signup, completeSignup, hydrated } = useDemo();

  const forced = useScreenState("SCR-ONB-04", [
    "default",
    "loading",
    "policy_error",
    "service_unavailable",
    "offline",
    "no_verification",
  ]);

  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const verified = signup?.stage === "set_password";
  const noVerification = forced === "no_verification" || (hydrated && !verified);
  const loading = busy || forced === "loading";

  /* E5 has no field to sit under, so it goes beside the button. */
  const serviceError =
    forced === "service_unavailable" && !dismissed
      ? "We couldn't finish setting up your account. Nothing you entered was lost — try again."
      : null;

  const submit = (name: string) => {
    setBusy(true);
    window.setTimeout(() => {
      completeSignup(name);
      const next = signup?.returnTo ?? "/welcome";
      router.push(next);
    }, ROUND_TRIP_MS);
  };

  return (
    <AuthShell
      scene={<PasswordScene />}
      title={
        <>
          Length beats <span className="ndi-wave-text">cleverness</span>
        </>
      }
      lead="A passphrase you won't reuse is stronger than a short password full of symbols — and this one will one day guard what your organisation holds."
    >
      <AuthCardHeader title="Set your password" subtitle="Your name and a password" />

      {noVerification && !loading ? (
        /* Arriving here without a confirmed address — a bookmark, a back
           button, a second tab — goes back to the start rather than letting
           a password be set for an address nobody proved. */
        <div className="relative z-[4] flex flex-col gap-4">
          <AuthNotice>
            We need to confirm your email address before you can set a password.
          </AuthNotice>
          <Link href="/sign-up" className="block">
            <GradientButton block>Start again</GradientButton>
          </Link>
        </div>
      ) : (
        <div className="relative z-[4] flex flex-col gap-[18px]">
          {forced === "offline" ? (
            <AuthNotice role="alert" tone="warning">
              That didn&rsquo;t send, so nothing was submitted. Check your connection and try
              again.
            </AuthNotice>
          ) : null}
          <AccountSetupForm
            idPrefix="signup"
            email={signup?.email ?? ""}
            intro={null}
            busy={loading}
            error={serviceError}
            onDismissError={() => setDismissed(true)}
            forcedPasswordError={forced === "policy_error" ? "Your password needs a symbol." : null}
            onSubmit={submit}
            submitLabel="Create account"
            busyLabel="Creating your account…"
          />
        </div>
      )}
    </AuthShell>
  );
}
