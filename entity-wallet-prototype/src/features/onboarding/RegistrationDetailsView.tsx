"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * The presenter's cheat-sheet — numbers that reach each outcome, and what
 * each one shows. Not the register: no product screen reads the register's
 * records (NDI never sees them), so these are written out here rather than
 * drawn from REGISTER_RECORDS, and drawn as a prototype control.
 */
const TRY_THESE: Record<string, { number: string; shows: string }[]> = {
  company: [
    { number: "CRA-2019-04477", shows: "Pelden Trading — the register shows Dorji as a director" },
    { number: "CRA-2015-03310", shows: "Norbu Construction — the register doesn't show Dorji" },
    { number: "CRA-2008-00731", shows: "Gangri Exports — no longer registered; worded the same" },
    { number: "CRA-2023-11802", shows: "Druk Valley Hardware — already verified here" },
    { number: "CRA-1997-00112", shows: "Bank of Bhutan — confirms Yeshey, its owner" },
  ],
  sole_proprietorship: [
    { number: "BL-PARO-2011-0387", shows: "Yangchen Handicrafts — the ministry doesn't show Dorji" },
  ],
  partnership: [],
};

/**
 * SCR-ORG-02 — Registration details. FLOW-ORG-01 step 1.
 *
 * ONE FIELD
 *
 * The registration identifier is the only thing the person types in the
 * whole flow — no name, no documents (step 1). Who they are comes from their
 * wallet on the next screen; what the organisation is called comes back from
 * the authority. This replaced a list the register returned to pick from,
 * which the specification never had: it would have handed NDI a list of who
 * represents what.
 *
 * THE FORMAT BEFORE THE FIELD, THE AUTHORITY ON THE BUTTON
 *
 * The expected format is stated before anyone types, and a wrong shape is
 * corrected inline before any request is made — a shape check only, never a
 * decision about the organisation. The button reads "Verify with
 * {authority}", not "Continue": it is the last thing read before a request
 * appears on another device, and naming the authority here is what makes
 * this screen and the wallet prompt agree (UC-09).
 *
 * E3 SAYS NOTHING ABOUT WHY
 *
 * A registration already verified here is refused with a message that does
 * not say whether the registration exists (S6), so the field cannot be used
 * to ask the platform what is registered.
 */
type Face = "default" | "invalid_format" | "loading" | "already_claimed";

export function RegistrationDetailsView() {
  const router = useRouter();
  const { orgOnboarding, orgInvitations, organizations, submitIdentifier, hydrated } = useDemo();
  const forced = useScreenState("SCR-ORG-02", ["live", "default", "invalid_format", "loading", "already_claimed"]);

  const kind = kindOf(orgOnboarding?.kind);
  const [value, setValue] = useState(orgOnboarding?.identifier ?? "");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refused, setRefused] = useState(false);
  const [supportNote, setSupportNote] = useState(false);

  const invitation = orgOnboarding?.invitationId
    ? orgInvitations.find((i) => i.id === orgOnboarding.invitationId)
    : undefined;
  const existing = orgOnboarding?.existingOrgId
    ? organizations.find((o) => o.id === orgOnboarding.existingOrgId)
    : undefined;
  const named = existing?.name ?? invitation?.legalName ?? null;

  const shapeOk = kind.pattern ? kind.pattern.test(value.trim()) : value.trim().length > 0;
  const natural: Face = busy ? "loading" : refused ? "already_claimed" : touched && !shapeOk ? "invalid_format" : "default";
  const face: Face = forced === "live" ? natural : (forced as Face);

  if (!hydrated) {
    return (
      <OnboardingShell current={1}>
        <div aria-hidden="true" className="h-56 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  if (!orgOnboarding && forced === "live") {
    return (
      <OnboardingShell current={1}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">Choose the type first</p>
            <p className="text-[13px] leading-[1.6] text-muted">
              The type decides which authority checks the registration.
            </p>
            <div>
              <Link href="/onboarding">
                <GradientButton>Choose the type</GradientButton>
              </Link>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  const submit = () => {
    setTouched(true);
    setRefused(false);
    if (!shapeOk) return;
    setBusy(true);
    window.setTimeout(() => {
      const r = submitIdentifier(value);
      setBusy(false);
      if (r.ok) router.push("/onboarding/prove");
      else if (r.error === "E1") router.push("/onboarding/not-supported");
      else setRefused(true);
    }, LOCAL_MS);
  };

  const errorId = "identifier-error";
  const formatId = "identifier-format";

  return (
    <OnboardingShell current={1}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          {named ? `${named}'s registration` : "Its registration"}
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          The {kind.authority} is asked about this registration, and whether its records show you as
          someone who represents it.
          {invitation?.legalName && !existing
            ? ` Your invitation names ${invitation.legalName}, but the invitation isn't the confirmation — the ${kind.authority} is.`
            : ""}
        </p>
      </div>

      <Panel>
        <form
          className="relative z-[4] flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          noValidate
        >
          <div className={FIELD_BLOCK_CLASS}>
            <label htmlFor="identifier" className={LABEL_CLASS}>
              {kind.identifierLabel ?? "Registration number"}
            </label>
            <p id={formatId} className="m-0 text-[12.5px] leading-[1.5] text-muted">
              {kind.format}, for example <span className="font-mono text-body">{kind.example}</span>
            </p>
            <input
              id="identifier"
              className={`${FIELD_CLASS} h-12 font-mono tracking-[0.02em]`}
              value={value}
              onChange={(e) => {
                setValue(e.target.value.toUpperCase());
                setRefused(false);
              }}
              onBlur={() => setTouched(value.trim().length > 0)}
              readOnly={face === "loading"}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={face === "invalid_format" || undefined}
              aria-describedby={face === "invalid_format" ? `${formatId} ${errorId}` : formatId}
            />
            {face === "invalid_format" ? (
              <p id={errorId} role="alert" className="m-0 flex items-start gap-2 text-[12.5px] leading-[1.5]" style={{ color: "var(--text-danger)" }}>
                <Icon name="shieldAlert" size={13} strokeWidth={2} className="mt-[3px] flex-none" />
                That doesn&rsquo;t match the format. It should look like {kind.example}.
              </p>
            ) : null}
          </div>

          {face === "already_claimed" ? (
            <div role="alert" className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                We can&rsquo;t verify that registration. If you think that&rsquo;s wrong, contact us.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setSupportNote(true)} className="ndi-plainlink text-[12.5px] font-medium text-accent">
                  Contact support
                </button>
                {supportNote ? (
                  <span role="status" className="text-[12px] text-faint">
                    Prototype — support isn&rsquo;t part of this demo.
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
            Next, the {kind.authority} sends a request to the NDI wallet on your phone, asking who you
            are. It can be answered on a different device from this one.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-4">
            <GradientButton type="submit" disabled={face === "loading"}>
              {face === "loading" ? (
                <>
                  <Icon name="refresh" size={15} strokeWidth={2} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  Verify with {kind.authority}
                  <Icon name="arrowRight" size={15} strokeWidth={2} />
                </>
              )}
            </GradientButton>
            <HairlineButton type="button" onClick={() => router.push("/onboarding")}>
              Back
            </HairlineButton>
            <button
              type="button"
              onClick={() => router.push(existing ? "/entity-wallet" : "/welcome")}
              className="ndi-plainlink text-[12.5px] font-medium text-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      </Panel>

      {TRY_THESE[kind.value]?.length ? (
        <SimulatedStep
          standsFor="knowing your registration number"
          action={TRY_THESE[kind.value].map((t) => (
            <SimulatedAction
              key={t.number}
              onClick={() => {
                setValue(t.number);
                setTouched(false);
                setRefused(false);
              }}
            >
              {t.number}
            </SimulatedAction>
          ))}
        >
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {TRY_THESE[kind.value].map((t) => (
              <li key={t.number}>
                <span className="font-mono">{t.number}</span> · {t.shows}
              </li>
            ))}
          </ul>
        </SimulatedStep>
      ) : null}
    </OnboardingShell>
  );
}
