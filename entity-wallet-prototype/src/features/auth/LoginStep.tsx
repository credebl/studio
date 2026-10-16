"use client";

import { useState } from "react";

import { GradientButton } from "@/components/ui/GradientButton";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";

import { AuthCardHeader, AuthError, AuthFooterLink } from "./AuthCard";

interface LoginStepProps {
  initialEmail?: string;
  /** Returns an error to show when the address has no account. */
  onSubmit: (email: string) => string | void;
  onForgotPassword: () => void;
  onCreateAccount: (email: string) => void;
}

/**
 * One card, both fields.
 *
 * Signing in used to take three: address, then a choice of method, then the
 * credential. The middle one existed to offer passkeys; with those gone it was
 * asking a question with one answer, and splitting address from password after
 * that bought nothing either.
 */
export function LoginStep({
  initialEmail = "",
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}: LoginStepProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) return setError("Enter the email address you sign in with.");
    if (!password) return setError("Enter your password.");
    setError(onSubmit(email) ?? "");
  };

  return (
    <>
      <AuthCardHeader title="Sign in" subtitle="Welcome back to NDI Studio" />

      <form
        noValidate
        /* The browser's own validation bubble would fire first and this card
           would never show its error bar. Ours says the same thing inside the
           card, where the rest of the feedback is. */
        className="relative z-[4] flex flex-col gap-[18px]"
        onSubmit={submit}
      >
        {error ? <AuthError message={error} onDismiss={() => setError("")} /> : null}

        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>Your email</span>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-[14px] text-faint">
              <Icon name="mail" size={16} strokeWidth={1.8} />
            </span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@company.bt"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${FIELD_CLASS} h-12 pl-[42px]`}
            />
          </div>
        </label>

        <label className={FIELD_BLOCK_CLASS}>
          <span className="flex items-baseline justify-between gap-3">
            <span className={LABEL_CLASS}>Password</span>
            <button
              type="button"
              onClick={onForgotPassword}
              className="ndi-plainlink text-[12.5px] text-accent"
            >
              Forgot password?
            </button>
          </span>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-[14px] text-faint">
              <Icon name="lock" size={16} strokeWidth={1.8} />
            </span>
            <input
              name="password"
              type={revealed ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${FIELD_CLASS} h-12 pl-[42px] pr-[42px]`}
            />
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              aria-label={revealed ? "Hide password" : "Show password"}
              className="ndi-plainlink absolute right-[14px] text-faint"
            >
              <Icon name={revealed ? "eyeOff" : "eye"} size={16} strokeWidth={1.8} />
            </button>
          </div>
        </label>

        <GradientButton type="submit" block className="mt-1">
          Sign in
          <Icon name="arrowRight" size={16} strokeWidth={2} />
        </GradientButton>
      </form>

      <AuthFooterLink
        prompt="New to NDI Studio?"
        action="Create an account"
        onClick={() => onCreateAccount(email)}
      />
    </>
  );
}
