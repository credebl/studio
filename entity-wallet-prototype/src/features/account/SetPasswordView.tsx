"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { PasswordScene } from "@/components/ui/scenes";
import { useReveal } from "@/components/ui/useReveal";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { AuthCardHeader, AuthError, AuthNotice } from "@/features/auth/AuthCard";

import { PASSWORD_RULES } from "./passwordPolicy";
import { ConfirmPasswordField, PASSWORDS_DIFFER } from "./ConfirmPasswordField";

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

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const results = useMemo(() => PASSWORD_RULES.map((r) => r.test(password)), [password]);
  const firstUnmet = PASSWORD_RULES.find((_, i) => !results[i]);

  const verified = signup?.stage === "set_password";
  const noVerification = forced === "no_verification" || (hydrated && !verified);
  const loading = busy || forced === "loading";

  const shownError =
    forced === "policy_error"
      ? "Your password needs a symbol."
      : forced === "service_unavailable"
        ? "We couldn't finish setting up your account. Nothing you entered was lost — try again."
        : error;

  /* The banner sits at the top of the card and the button at the bottom;
     on a phone the two are a screen apart, so a refusal is brought up to
     where the person is looking. */
  const errorRef = useReveal<HTMLDivElement>(shownError);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError("Enter your name.");
    if (firstUnmet) {
      setTouched(true);
      return setError(`Your password needs ${firstUnmet.label.toLowerCase()}.`);
    }
    if (confirm !== password) return setError(PASSWORDS_DIFFER);
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      completeSignup(name.trim());
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
      lead="A passphrase you won't reuse is stronger than a short password full of symbols — and this one will one day guard an organisation's credentials."
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
        <form noValidate className="relative z-[4] flex flex-col gap-[18px]" onSubmit={submit}>
          {forced === "offline" ? (
            <AuthNotice role="alert" tone="warning">
              That didn&rsquo;t send, so nothing was submitted. Check your connection and try
              again.
            </AuthNotice>
          ) : null}
          {shownError ? (
            <div ref={errorRef}>
              <AuthError message={shownError} onDismiss={() => setError(null)} />
            </div>
          ) : null}

          {signup?.email ? (
            <span className="inline-flex items-center gap-2.5 self-center rounded-full border border-grid bg-[var(--ndi-mint-04)] px-4 py-2 text-[13px] text-body">
              <Icon name="check" size={14} strokeWidth={2.2} className="text-accent" />
              <span className="break-words">{signup.email}</span>
            </span>
          ) : null}

          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Your name</span>
            <input
              name="name"
              autoComplete="name"
              placeholder="As it appears on your citizenship ID"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className={`${FIELD_CLASS} h-12`}
            />
          </label>

          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Password</span>
            <div className="relative flex items-center">
              <input
                name="newPassword"
                type={revealed ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                disabled={loading}
                aria-describedby="password-rules"
                className={`${FIELD_CLASS} h-12 pr-[48px]`}
              />
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                aria-label={revealed ? "Hide password" : "Show password"}
                className="ndi-plainlink absolute right-[6px] flex h-11 w-11 items-center justify-center text-faint"
              >
                <Icon name={revealed ? "eyeOff" : "eye"} size={16} strokeWidth={1.8} />
              </button>
            </div>
          </label>

          {/* Pulled up to the field it describes: at the form's 18px rhythm
              the rules read as a separate block rather than the password's
              own notes. */}
          <ul id="password-rules" className="m-0 -mt-1.5 flex list-none flex-col gap-1.5 p-0" aria-live="polite">
            {PASSWORD_RULES.map((rule, i) => {
              const met = results[i];
              const failing = touched && !met;
              return (
                <li
                  key={rule.label}
                  className="flex items-center gap-2 text-[12.5px]"
                  style={{
                    color: met ? "var(--accent)" : failing ? "var(--text-danger)" : "var(--text-faint)",
                  }}
                >
                  <Icon
                    name={met ? "check" : failing ? "close" : "info"}
                    size={13}
                    strokeWidth={2.2}
                    className="flex-none"
                  />
                  {rule.label}
                  <span className="sr-only">{met ? " — met" : failing ? " — not met yet" : ""}</span>
                </li>
              );
            })}
          </ul>

          <ConfirmPasswordField
            id="signup-confirm"
            password={password}
            value={confirm}
            onChange={setConfirm}
            revealed={revealed}
            disabled={loading}
          />

          <GradientButton type="submit" block disabled={loading} className="mt-1">
            {loading ? "Creating your account…" : "Create account"}
            {loading ? null : <Icon name="arrowRight" size={16} strokeWidth={2} />}
          </GradientButton>
        </form>
      )}
    </AuthShell>
  );
}
