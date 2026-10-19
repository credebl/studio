"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { inOrg, requestInFlight } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, ROUND_TRIP_MS } from "@/lib/demoTiming";

import { cannotAsk, issuerInline, useHolder } from "./shared";

/**
 * SCR-CRD-02 — Ask for a credential. FLOW-CRD-01 step 2: one consent, to
 * share a credential the organisation holds with this issuer, and to receive
 * this one.
 *
 * EVERY ATTRIBUTE, BECAUSE ALL OF IT GOES
 *
 * The prerequisite is a JSON-LD credential, and those can't be shared in
 * part (EW-FLOW6-SD/D20). So the screen lists every attribute in it — the
 * address and date of incorporation the issuer doesn't need included — and
 * separately what the issuer says it uses. The tempting version lists only
 * the used items under "what is shared", which reads better and is false.
 * The screen must never claim that only some of it is shared.
 *
 * THE SECOND DECISION, NAMED AT THE FIRST
 *
 * Asking doesn't put anything in the wallet. The issuer decides, may
 * decline, and whatever it sends waits for someone here to accept it. Said
 * now, so that the offer arriving later reads as the expected next step
 * rather than a surprise to be suspicious of (UN-37, UC-27).
 *
 * The store decides whether the request is allowed (P1–P5); the faces
 * below render what it said.
 */
type Face = "live" | "default" | "loading" | "submitted" | "e3" | "e4" | "e5" | "offline" | "no_permission";

export function AskForCredentialView({ offeringId }: { offeringId: string }) {
  const router = useRouter();
  const { offerings, credentialRequests, askForCredential, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-02", ["live", "default", "loading", "submitted", "e3", "e4", "e5", "offline", "no_permission"]) as Face;

  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refused, setRefused] = useState<"E3" | "E4" | "E5" | "offline" | null>(null);

  const offering = offerings.find((o) => o.id === offeringId);
  const existing = credentialRequests.find((r) => inOrg(holder.orgId)(r) && r.offeringId === offeringId && requestInFlight(r));

  const natural: Face = submitted
    ? "submitted"
    : busy
      ? "loading"
      : refused === "E3" || !offering || offering.status !== "ACTIVE"
        ? "e3"
        : refused === "E5" || (existing && !submitted)
          ? "e5"
          : refused === "E4" || !holder.held.some((c) => c.type === offering.prerequisite.credential)
            ? "e4"
          : refused === "offline"
            ? "offline"
            : !holder.can("credential:receive")
              ? "no_permission"
              : "default";
  const face: Face = forced === "live" ? natural : forced;

  const issuer = offering?.issuerName ?? "The issuer";
  const credential = offering?.credential ?? "this credential";

  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Get a credential", href: "/wallet/get" }, { label: credential }]}
      title={`Ask ${issuerInline(issuer)} for your ${credential}`}
    />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const ask = () => {
    if (forced === "offline") {
      setRefused("offline");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const r = askForCredential(offeringId);
      setBusy(false);
      if (r.ok) {
        setSubmitted(true);
        /* The confirmation, then where it stands — the spec's "Submitted"
           is a moment, not a page to dismiss. */
        window.setTimeout(() => router.push(`/wallet/requests/${r.id}`), ROUND_TRIP_MS);
      } else if (r.error === "E3" || r.error === "E4" || r.error === "E5") setRefused(r.error);
    }, LOCAL_MS);
  };

  if (face === "submitted") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <p role="status" className="relative z-[4] m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
              <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
              Asked. Sending your {offering?.prerequisite.credential ?? "credential"} to {issuerInline(issuer)}…
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "e3" || face === "e4" || face === "e5") {
    /* E4 arrives here only by address — the catalogue doesn't offer Ask
       until the prerequisite is held — so it says what's needed and offers
       the way to get it. */
    const prereq = offerings.find((o) => o.credential === offering?.prerequisite.credential && o.status === "ACTIVE");
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="alert" className="m-0 text-[14px] leading-[1.6] text-body">
                {face === "e3"
                  ? `${issuer} isn't offering this at the moment. Nothing has been sent.`
                  : face === "e4"
                    ? `To ask for this you first need: ${offering?.prerequisite.credential ?? "another credential"}.`
                    : "You've already asked for this. Here's where it stands."}
              </p>
              <div>
                {face === "e5" && existing ? (
                  <GradientButton onClick={() => router.push(`/wallet/requests/${existing.id}`)}>Go to status</GradientButton>
                ) : face === "e5" ? (
                  <GradientButton onClick={() => router.push("/wallet/requests")}>Go to status</GradientButton>
                ) : face === "e4" && prereq ? (
                  <GradientButton onClick={() => router.push(`/wallet/get/${prereq.id}`)}>Get {prereq.credential}</GradientButton>
                ) : (
                  <HairlineButton onClick={() => router.push("/wallet/get")}>Back to the list</HairlineButton>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (!offering) return null;
  const readOnly = face === "no_permission";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            That didn&rsquo;t go through, so nothing was sent. Try again when you&rsquo;re back online.
          </p>
        ) : null}
        {readOnly ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {cannotAsk(holder.rootName)}
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            {/* The share-and-receive summary (§3.4): what goes, to whom, beside
                what comes back. Two columns from tablet width; stacked, the
                order still reads share first. */}
            <div className="grid gap-4 min-[761px]:grid-cols-2">
              <section aria-labelledby="ask-share" className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3">
                <h2 id="ask-share" className={LABEL_CLASS}>
                  You share
                </h2>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  To decide, {issuerInline(issuer)} needs to see your {offering.prerequisite.credential}. It will
                  receive all of it:
                </p>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {offering.prerequisite.attributes.map((a) => {
                    const used = offering.prerequisite.uses.includes(a);
                    return (
                      <li key={a} className="flex items-baseline justify-between gap-3 text-[13px] text-body">
                        <span>{a}</span>
                        <span className="text-[12px] text-faint">{used ? "Used" : "Shared, not used"}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  {issuer} says it uses: {offering.prerequisite.uses.join(", ")}. None of your other credentials is
                  shared.
                </p>
              </section>
              <section aria-labelledby="ask-receive" className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3">
                <h2 id="ask-receive" className={LABEL_CLASS}>
                  You may receive
                </h2>
                <p className="m-0 text-[14px] font-medium text-strong">{offering.credential}</p>
                <p className="m-0 text-[13px] text-muted">From {issuer}</p>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {offering.fields.map((f) => (
                    <li key={f.name} className="text-[13px] text-body">
                      {f.label}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className={LABEL_CLASS}>What happens next</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                {issuer} will check and reply, usually within {offering.answerWindowDays} days. It may decline. You&rsquo;ll
                choose whether to accept what they send — nothing is added to your credentials until someone here
                accepts it.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={ask} disabled={readOnly || face === "loading"}>
                {face === "loading" ? "Asking…" : `Ask ${issuerInline(issuer)}`}
              </GradientButton>
              <HairlineButton onClick={() => router.push("/wallet/get")}>Cancel</HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
