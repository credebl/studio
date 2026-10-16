"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { SecureSignInScene } from "@/components/ui/scenes";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { AuthCardHeader, AuthError, AuthFooterLink, AuthNotice } from "@/features/auth/AuthCard";

import { PASSWORD_SUMMARY } from "./passwordPolicy";

/**
 * SCR-ONB-01 — Sign up. FLOW-ONB-01 step 1.
 *
 * An email address, and nothing else. No name, no organisation, no national
 * ID: the account this creates is a shell that can do nothing (§7.3), and
 * everything a reader might expect to be collected here is collected later,
 * by the flow that needs it.
 *
 * THE ERROR THAT SAYS NOTHING, ON PURPOSE
 *
 * An address that is already registered (E1) and a request the rate limiter
 * refused (E7) render the same message, at the same speed (S3, UXD-02).
 * Telling someone "that address is taken" is friendlier and turns this form
 * into a way to test which addresses have accounts. The specification lists
 * two slightly different second sentences for E1 and E7 and then flags that
 * they must match; this screen uses one message for both, which is the only
 * reading that satisfies the rule it is flagged against.
 *
 * The delay before the next screen is the same whether the address is taken
 * or not — the check happens inside the wait, not before it — because a
 * refusal that comes back faster than a success is the same leak by a
 * different channel.
 *
 * THE NOTICE BEFORE THE FIELD
 *
 * Proxy sign-up — an accountant or a relative creating the account — cannot
 * be detected here (UXD-09). The only in-product control is a notice read
 * before the address is typed, so it sits above the field rather than under
 * it. Identity anchoring when the organisation is registered is the real
 * control, and it fails in the right place.
 */
const INDISTINGUISHABLE = "We couldn't continue with that address. Try signing in, or reset your password.";

export function SignUpView() {
  const router = useRouter();
  const { signup, people, startSignup, hydrated, harness } = useDemo();

  const forced = useScreenState("SCR-ONB-01", [
    "default",
    "loading",
    "error",
    "offline",
    "disabled",
  ]);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Returning to correct the address brings it back pre-filled — the point of
     "Wrong address? Change it" on the next screen. */
  useEffect(() => {
    if (hydrated && signup?.email) setEmail(signup.email);
  }, [hydrated, signup?.email]);

  const fromInvitation = Boolean(signup?.returnTo);
  /* With self-service off, the public route stops here — but an invitee
     sent to create an account (FLOW-ONB-02 A1) still gets through. P3
     switches off the open door, not the one an invitation opens. */
  const disabled = forced === "disabled" || (!harness.selfServiceSignup && !fromInvitation);
  const loading = busy || forced === "loading";
  const shownError = forced === "error" ? INDISTINGUISHABLE : error;
  const offline = forced === "offline";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    /* A malformed address is a correction, not a refusal — it says nothing
       about who is registered, so it can be specific. */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
      setError("Enter an email address, like name@company.bt.");
      return;
    }
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      /* Only accounts that exist count: on the platform's day zero NDI's own
         staff are known to the story but have not signed up yet. */
      const taken = people.some(
        (p) => p.hasAccount !== false && p.email.toLowerCase() === address.toLowerCase(),
      );
      if (taken) {
        /* FLOW-ONB-01 A1: someone arriving from an invitation who already
           has an account is sent to sign in. That is not a disclosure — the
           invitation was addressed to them. Anywhere else it would be. */
        setError(
          fromInvitation
            ? "You already have an account — sign in to accept this invitation."
            : INDISTINGUISHABLE,
        );
        return;
      }
      startSignup(address);
      router.push("/sign-up/check-email");
    }, LOCAL_MS);
  };

  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          One account, <span className="ndi-wave-text">then your organisation</span>
        </>
      }
      lead="Creating an account takes a couple of minutes and gives you a sign-in. Adding the organisation you act for comes next, and that is where your identity is checked."
    >
      <AuthCardHeader
        title="Create your account"
        subtitle={
          disabled
            ? undefined
            : "You'll need an email address you can open now. We'll send you a link to confirm it."
        }
      />

      {disabled ? (
        /* The route still resolves when sign-up is switched off (P3): people
           will have been given this URL, and a 404 would tell them the
           platform is broken rather than that access is by invitation. */
        <div className="relative z-[4] flex flex-col gap-4">
          <AuthNotice>
            <p className="m-0 font-medium text-strong">Accounts on this platform are by invitation.</p>
            <p className="m-0 mt-1 text-muted">
              If your organisation has been invited, open the link in that email. Otherwise, ask
              whoever manages your organisation&rsquo;s account to invite you.
            </p>
          </AuthNotice>
          <Link href="/sign-in" className="block">
            <GradientButton block>
              Sign in
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </GradientButton>
          </Link>
        </div>
      ) : (
        <form noValidate className="relative z-[4] flex flex-col gap-[18px]" onSubmit={submit}>
          {offline ? (
            <AuthNotice role="alert" tone="warning">
              Your request wasn&rsquo;t sent, so nothing was created. Check your connection and try
              again.
            </AuthNotice>
          ) : null}
          {shownError ? <AuthError message={shownError} onDismiss={() => setError(null)} /> : null}

          <AuthNotice tone="warning">
            This account should belong to <strong className="text-strong">you</strong>, not to
            someone helping you. Later you&rsquo;ll be asked to confirm your identity, and it must
            match the person named here.
          </AuthNotice>

          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Email address</span>
            <div className="relative flex items-center">
              <span className="pointer-events-none absolute left-[14px] text-faint">
                <Icon name="mail" size={16} strokeWidth={1.8} />
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="name@company.bt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                aria-describedby="signup-email-help"
                className={`${FIELD_CLASS} h-12 pl-[42px]`}
              />
            </div>
            <span id="signup-email-help" className="text-[12.5px] leading-[1.5] text-faint">
              Use an address you check — we&rsquo;ll send anything important here.
            </span>
          </label>

          {/* Stated here, before the password screen, so nobody meets the
              policy for the first time as an error. */}
          <p className="m-0 text-[12.5px] leading-[1.5] text-faint">{PASSWORD_SUMMARY}</p>

          <GradientButton type="submit" block disabled={loading || !hydrated} className="mt-1">
            {loading ? "Sending your link…" : "Continue"}
            {loading ? null : <Icon name="arrowRight" size={16} strokeWidth={2} />}
          </GradientButton>
        </form>
      )}

      {disabled ? null : (
        <AuthFooterLink
          prompt="Already have an account?"
          action="Sign in instead"
          onClick={() => router.push("/sign-in")}
        />
      )}
    </AuthShell>
  );
}
