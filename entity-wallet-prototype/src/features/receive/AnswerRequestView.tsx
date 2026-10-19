"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { useIssuer } from "./issuerShared";
import { KIND_WORDS, daysLeft, valueFor } from "./shared";

/**
 * SCR-CRD-09 — Answer a request. FLOW-CRD-03 step 6: issue with the right
 * details, or decline with a reason the business can act on.
 *
 * EVIDENCE, THEN CONTEXT — NEVER MIXED
 *
 * Two panels with text labels. *Verified* holds each item the business
 * proved, the credential it came from and who issued that. *From NDI (not
 * verified by you)* holds the display name and entity type NDI has on
 * record — useful for recognising a business, worthless as evidence. The
 * failure this screen is built against isn't a system error: it's an
 * officer issuing a taxpayer number on the strength of a name NDI showed
 * them (UC-30). So the context sits below the evidence, and the sentence at
 * the top says which one to decide on. That sentence must survive review
 * unchanged.
 *
 * THE BUSINESS READS THE DECLINE VERBATIM
 *
 * The message is carried to SCR-CRD-03 exactly as written (UN-41), so the
 * field says so. A reason code goes with it for the issuer's own records.
 *
 * Who may answer, and whether it's already answered or expired, is the
 * store's decision (E7, E10); the faces render what it returned.
 */
type Face = "live" | "default" | "loading" | "e8" | "e10" | "e7" | "e11" | "sent" | "offline";

const REASONS = [
  { value: "REGISTER_MISMATCH", label: "Doesn't match our register" },
  { value: "NOT_ELIGIBLE", label: "Not eligible for this credential" },
  { value: "ALREADY_ISSUED", label: "Already issued to this business" },
  { value: "OTHER", label: "Another reason" },
];

export function AnswerRequestView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { credentialRequests, organizations, heldCredentials, offerings, personById, issueOnRequest, declineOnRequest, hydrated } = useDemo();
  const issuer = useIssuer();
  const forced = useScreenState("SCR-CRD-09", ["live", "default", "loading", "e8", "e10", "e7", "e11", "sent", "offline"]) as Face;

  const r = credentialRequests.find((x) => x.id === requestId);
  const offering = offerings.find((o) => o.id === r?.offeringId);
  /* Only what the officer has changed. The rest reads from the offering's
     prefilled values, so a page loaded before the store hydrates doesn't
     lock in an empty form. */
  const [edits, setEdits] = useState<Record<string, string>>({});
  const values: Record<string, string> = Object.fromEntries((offering?.fields ?? []).map((f) => [f.name, edits[f.name] ?? f.example]));
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<"issued" | "declined" | null>(null);
  const [failed, setFailed] = useState<"E7" | "E10" | "offline" | null>(null);
  const [declining, setDeclining] = useState(false);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  const org = organizations.find((o) => o.id === r?.orgId);
  const business = org ? shortOrgName(org.name) : "The business";
  const prereq = r ? heldCredentials.filter(inOrg(r.orgId)).find((c) => c.type === r.consented.credential) : undefined;
  const missing = (offering?.fields ?? []).filter((f) => !values[f.name]?.trim());

  const natural: Face = sent
    ? "sent"
    : busy
      ? "loading"
      : failed === "E7"
        ? "e7"
        : failed === "offline"
          ? "offline"
          : r?.state === "WITHDRAWN"
            ? "e11"
            : failed === "E10" || (r && r.state !== "WITH_ISSUER")
              ? "e10"
              : touched && missing.length
                ? "e8"
                : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader
      crumbs={[{ label: issuer.name }, { label: "Requests to answer", href: "/issuer/requests" }, { label: r?.credential ?? "Request" }]}
      title={r ? `${r.credential} for ${business}` : "Not found"}
    />
  );

  if (!r || !offering || !issuer.isOfficer) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
          {header}
          <Panel>
            <p className="relative z-[4] m-0 text-[14px] text-body">
              {!issuer.isOfficer ? "Only an issuing office's officers answer requests." : "There's no request here."}
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const next = () => {
    const after = credentialRequests
      .filter((x) => x.issuerOrgId === r.issuerOrgId && x.state === "WITH_ISSUER" && x.id !== r.id)
      .sort((a, b) => ((a.answerBy ?? "") < (b.answerBy ?? "") ? -1 : 1))[0];
    router.push(after ? `/issuer/requests/${after.id}` : "/issuer/requests");
  };

  if (face === "sent" || face === "e10" || face === "e7" || face === "e11") {
    const text =
      face === "sent"
        ? sent === "declined"
          ? `Declined. ${business} will see your message exactly as you wrote it.`
          : `Sent. It may take a moment to reach ${business}.`
        : face === "e10"
          ? `${r.answeredBy ? personById(r.answeredBy).name : "A colleague"} already answered this: ${
              r.state === "DECLINED_BY_ISSUER" ? "declined" : "issued"
            }.`
          : face === "e7"
            ? `This request expired on ${formatDate(r.answerBy ?? r.requestedAt)}. ${business} can ask again.`
            : `${business} withdrew this request.`;
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                {face === "sent" ? (
                  <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                ) : null}
                {text}
              </p>
              <div>
                <GradientButton onClick={next}>Next</GradientButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const issue = () => {
    setTouched(true);
    if (forced === "e8" || missing.length) return;
    if (forced === "offline") {
      setFailed("offline");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const res = issueOnRequest(
        r.id,
        offering.fields.map((f) => ({ name: f.name, value: values[f.name].trim() })),
      );
      setBusy(false);
      if (res.ok) setSent("issued");
      else if (res.error === "E7" || res.error === "E10") setFailed(res.error);
    }, ROUND_TRIP_MS);
  };

  const decline = () => {
    setDeclining(false);
    const res = declineOnRequest(r.id, code, message);
    if (res.ok) setSent("declined");
    else if (res.error === "E7" || res.error === "E10") setFailed(res.error);
  };

  const fieldError = (name: string) => (face === "e8" && (forced === "e8" ? name === offering.fields[0].name : !values[name]?.trim()) ? "Enter a value." : null);

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            That didn&rsquo;t go through, so nothing was sent. What you entered is kept — try again when you&rsquo;re back.
          </p>
        ) : null}

        <p className="m-0 max-w-[70ch] rounded-[12px] border border-grid px-4 py-3 text-[14px] leading-[1.6] text-strong" style={{ background: "rgb(var(--tint) / 0.04)" }}>
          Decide on what {business} has proved. The name and type shown below come from NDI, not from {business}&rsquo;s
          credentials.
        </p>

        <Panel>
          <section aria-labelledby="ans-verified" className="relative z-[4] flex flex-col gap-3">
            <h2 id="ans-verified" className="m-0 flex items-center gap-2 font-display text-[15px] font-semibold text-strong">
              <Icon name="shieldCheck" size={15} strokeWidth={2} style={{ color: "var(--ndi-success)" }} />
              Verified
            </h2>
            <dl className="m-0 grid gap-x-6 gap-y-3 min-[641px]:grid-cols-2">
              {r.consented.uses.map((u) => (
                <div key={u} className="flex flex-col gap-0.5">
                  <dt className={LABEL_CLASS}>{u}</dt>
                  <dd className="m-0 text-[14px] text-body">{(prereq && valueFor(prereq.attributes, u)) ?? "—"}</dd>
                </div>
              ))}
            </dl>
            <p className="m-0 text-[12.5px] text-muted">
              From their {r.consented.credential}, issued by {r.consented.issuer}.
            </p>
          </section>
        </Panel>

        <section
          aria-labelledby="ans-context"
          className="flex flex-col gap-3 rounded-[16px] border border-dashed px-5 py-4"
          style={{ borderColor: "var(--border-strong)" }}
        >
          <h2 id="ans-context" className="m-0 font-display text-[14px] font-semibold text-muted">
            From NDI (not verified by you)
          </h2>
          <dl className="m-0 grid gap-x-6 gap-y-3 min-[641px]:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className={LABEL_CLASS}>Display name</dt>
              <dd className="m-0 text-[13.5px] text-muted">{org?.name ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className={LABEL_CLASS}>Entity type</dt>
              <dd className="m-0 text-[13.5px] text-muted">{KIND_WORDS[org?.kind ?? "company"]}</dd>
            </div>
          </dl>
        </section>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">The {r.credential}</h2>
            <div className="grid gap-4 min-[641px]:grid-cols-2">
              {offering.fields.map((f) => {
                const err = fieldError(f.name);
                return (
                  <label key={f.name} className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>{f.label}</span>
                    <input
                      className={FIELD_CLASS}
                      value={values[f.name] ?? ""}
                      aria-invalid={err ? true : undefined}
                      aria-describedby={err ? `err-${f.name}` : undefined}
                      onChange={(e) => setEdits((v) => ({ ...v, [f.name]: e.target.value }))}
                      disabled={face === "loading"}
                    />
                    {err ? (
                      <span id={`err-${f.name}`} className="text-[12.5px]" style={{ color: "var(--text-danger)" }}>
                        {f.label}: {err.toLowerCase()}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
            <p className="m-0 text-[13px] text-muted">
              Valid until it&rsquo;s revoked. {daysLeft(r.answerBy)} days left to answer — by {formatDate(r.answerBy ?? r.requestedAt)}.
            </p>
            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={issue} disabled={face === "loading"}>
                {face === "loading" ? "Issuing…" : "Issue"}
              </GradientButton>
              <HairlineButton onClick={() => setDeclining(true)} disabled={face === "loading"}>
                Decline
              </HairlineButton>
            </div>
          </div>
        </Panel>

        <Dialog
          open={declining}
          onClose={() => setDeclining(false)}
          title={`Decline ${business}'s request?`}
          lead="Nothing is issued. The business can ask again."
          confirmLabel="Decline"
          confirmDisabled={!code || !message.trim()}
          onConfirm={decline}
        >
          <div className="flex flex-col gap-4">
            <Select label="Reason" value={code} onChange={setCode} placeholder="Choose a reason" options={REASONS} />
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>What should {business} be told? They&rsquo;ll see this exactly as you write it.</span>
              <textarea className={`${FIELD_CLASS} resize-y py-3`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
          </div>
        </Dialog>
      </div>
    </AppShell>
  );
}
