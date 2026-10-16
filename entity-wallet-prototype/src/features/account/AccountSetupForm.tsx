"use client";

import { useMemo, useState } from "react";

import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useReveal } from "@/components/ui/useReveal";

import { AuthError } from "@/features/auth/AuthCard";

import { ConfirmPasswordField } from "./ConfirmPasswordField";
import { PASSWORD_RULES } from "./passwordPolicy";

/**
 * Setting up an account from an invitation link: a name and a password,
 * entered twice. Accepting the invitation happens in the same step.
 *
 * WHY THE LINK IS ENOUGH
 *
 * Someone opening an invitation has already proved the one thing email
 * verification proves — that they read mail at the invited address — so
 * sending them through sign-up to confirm it again (type the address, wait
 * for a second email, open it, come back) was four screens of re-proving it.
 * Platform admins set up this way first; members of an organisation now do
 * too, so an invitation behaves the same whoever sent it.
 *
 * ONE FORM, TWO INVITATIONS
 *
 * The admin's invitation and the member's invitation each had, or were about
 * to have, their own copy of these fields, rules and checks. Two copies of a
 * password form drift — one gets the confirm field and the other does not,
 * which is exactly how company sign-up briefly asked for the password once
 * while the admin's set-up asked twice. The rules are the same ones sign-up
 * shows (FLOW-ONB-01 E8): on screen before the first character, neutral
 * until the field is left, and a miss names the rule rather than the policy.
 *
 * ERRORS SIT AT THE FIELD THAT CAUSED THEM
 *
 * The first version put every error in a banner at the top of the form. The
 * form is long — the invitation's summary sits above it — so a person who
 * pressed the button at the bottom got a message above the top of the
 * screen and saw nothing happen. Now the message is under the field that
 * needs changing, and focus moves to that field, which also brings it into
 * view (WCAG 3.3.1: the error is identified in text, where it applies). An
 * error from outside the form — the invitation refused as it was accepted —
 * has no field, so it sits beside the button that was pressed.
 *
 * The password goes nowhere. It is checked here and dropped; the store is
 * only ever given the name.
 */
export function AccountSetupForm({
  email,
  busy,
  error,
  onDismissError,
  onSubmit,
  submitLabel,
  busyLabel,
  onDecline,
  idPrefix,
  intro,
  forcedPasswordError,
}: {
  /** The invited address, shown so the person can see whose account this is. */
  email: string;
  busy: boolean;
  /** An error from outside the form — the invitation refused at acceptance. */
  error?: string | null;
  onDismissError?: () => void;
  /** Called with the trimmed name once every check has passed. */
  onSubmit: (name: string) => void;
  submitLabel: string;
  busyLabel: string;
  onDecline?: () => void;
  /** Keeps ids unique if two forms ever share a page. */
  idPrefix: string;
  /**
   * The line under the address. Defaults to the invitation's ("this link
   * came to your address"); sign-up passes null, because there the address
   * was confirmed by the email round trip and the line would be untrue.
   */
  intro?: React.ReactNode | null;
  /** A password-rule miss to show at the field — the state switcher's E8. */
  forcedPasswordError?: string | null;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmMissing, setConfirmMissing] = useState(false);

  const results = useMemo(() => PASSWORD_RULES.map((r) => r.test(password)), [password]);
  const firstUnmet = PASSWORD_RULES.find((_, i) => !results[i]);
  const errorRef = useReveal<HTMLDivElement>(error);

  const focus = (id: string) => document.getElementById(id)?.focus();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setNameError(null);
    setPasswordError(null);
    setConfirmMissing(false);
    if (!name.trim()) {
      setNameError("Enter your name.");
      return focus(`${idPrefix}-name`);
    }
    if (firstUnmet) {
      setTouched(true);
      setPasswordError(`Your password needs ${firstUnmet.label.toLowerCase()}.`);
      return focus(`${idPrefix}-password`);
    }
    if (confirm === "") {
      setConfirmMissing(true);
      return focus(`${idPrefix}-confirm-input`);
    }
    /* A mismatch is already said beside the field as it is typed; sending
       the form only moves focus there. */
    if (confirm !== password) return focus(`${idPrefix}-confirm-input`);
    onSubmit(name.trim());
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-[18px]">
      <span className="inline-flex items-center gap-2.5 self-center rounded-full border border-grid bg-[var(--ndi-mint-04)] px-4 py-2 text-[13px] text-body">
        <Icon name="check" size={14} strokeWidth={2.2} className="text-accent" />
        <span className="break-words">{email}</span>
      </span>
      {intro === undefined ? (
        <p className="m-0 -mt-1 text-center text-[13px] leading-[1.6] text-muted">
          Set up your account to accept. This link came to your address, so there&rsquo;s nothing
          else to confirm.
        </p>
      ) : intro}

      <div className={FIELD_BLOCK_CLASS}>
        <label htmlFor={`${idPrefix}-name`} className={LABEL_CLASS}>
          Your name
        </label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          autoComplete="name"
          placeholder="As it appears on your citizenship ID"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(null);
          }}
          disabled={busy}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? `${idPrefix}-name-error` : undefined}
          className={`${FIELD_CLASS} h-12`}
        />
        {nameError ? <FieldError id={`${idPrefix}-name-error`} message={nameError} /> : null}
      </div>

      <div className={FIELD_BLOCK_CLASS}>
        <label htmlFor={`${idPrefix}-password`} className={LABEL_CLASS}>
          Password
        </label>
        <div className="relative flex items-center">
          <input
            id={`${idPrefix}-password`}
            name="newPassword"
            type={revealed ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
            }}
            onBlur={() => setTouched(true)}
            disabled={busy}
            aria-invalid={passwordError || forcedPasswordError ? true : undefined}
            aria-describedby={`${idPrefix}-password-rules${passwordError || forcedPasswordError ? ` ${idPrefix}-password-error` : ""}`}
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
        <ul id={`${idPrefix}-password-rules`} className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0" aria-live="polite">
          {PASSWORD_RULES.map((rule, i) => {
            const met = results[i];
            const failing = touched && !met;
            return (
              <li
                key={rule.label}
                className="flex items-center gap-2 text-[12.5px]"
                style={{ color: met ? "var(--accent)" : failing ? "var(--text-danger)" : "var(--text-faint)" }}
              >
                <Icon name={met ? "check" : failing ? "close" : "info"} size={13} strokeWidth={2.2} className="flex-none" />
                {rule.label}
                <span className="sr-only">{met ? " — met" : failing ? " — not met yet" : ""}</span>
              </li>
            );
          })}
        </ul>
        {passwordError || forcedPasswordError ? (
          <FieldError id={`${idPrefix}-password-error`} message={(passwordError ?? forcedPasswordError) as string} />
        ) : null}
      </div>

      <ConfirmPasswordField
        id={`${idPrefix}-confirm`}
        password={password}
        value={confirm}
        onChange={(v) => {
          setConfirm(v);
          setConfirmMissing(false);
        }}
        revealed={revealed}
        disabled={busy}
        missing={confirmMissing}
      />

      <div className="flex flex-col gap-2.5">
        {error ? (
          <div ref={errorRef}>
            <AuthError message={error} onDismiss={() => onDismissError?.()} />
          </div>
        ) : null}
        <GradientButton type="submit" block disabled={busy}>
          {busy ? busyLabel : submitLabel}
          {busy ? null : <Icon name="arrowRight" size={16} strokeWidth={2} />}
        </GradientButton>
        {onDecline ? (
          <HairlineButton onClick={onDecline} disabled={busy}>
            Decline
          </HairlineButton>
        ) : null}
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="m-0 flex items-start gap-2 text-[12.5px] leading-[1.5]" style={{ color: "var(--text-danger)" }}>
      <Icon name="shieldAlert" size={13} strokeWidth={2} className="mt-[3px] flex-none" />
      {message}
    </p>
  );
}
