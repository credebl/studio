"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import {
  ENFORCEMENT_DATE,
  NDI_ORG,
  OBSERVED_OPERATORS,
  accInProgress,
  isNamedAdmin,
  type AccCapability,
  type AskItem,
  type IssueType,
} from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { issueOverlaps } from "./Criteria";
import { IssueTypesEditor, ItemChooser, inline, sameItem, scopeSentence } from "./shared";

/**
 * SCR-ACC-01 — Propose an accreditation. FLOW-ACC-01 step 1.
 *
 * ONE FORM, THREE STARTING POINTS
 *
 * An institution not on the platform yet (Kind N: its legal name and the
 * officer who will register it), an organisation already on it (Kind E),
 * or one already operating that the gate has seen (recognition, opened from
 * the list with what it was seen doing filled in). They differ in who the
 * organisation is and where the scope starts; everything after that — the
 * purpose, the scope no wider than it, the second administrator — is the
 * same, so it is one form rather than three.
 *
 * THE SUMMARY IS LIVE, AND SAYS WHAT WILL BE REFUSED
 *
 * Beside the form, what the organisation will be able to do is written out
 * as it is built, with the negative clause — "anything else will be
 * refused" — and the fact that it will be publicly listed. The proposer
 * should read the outcome, not reconstruct it from ticked boxes.
 *
 * RECOGNITION IS WHERE THE SCOPE GETS NARROWER
 *
 * Bank of Bhutan has been asking customers for five things from their
 * citizen credential to open an account. Recognition starts from those five,
 * each marked "observed", and the date after which anything outside the
 * approval is refused. Removing what the purpose doesn't need is the point
 * of the step (UC-25); the screen makes that easy and says why.
 */
type Face = "live" | "default" | "recognition" | "empty" | "error" | "overlap" | "success" | "offline" | "no_permission";
type Kind = "EXISTING" | "NEW";

const DRAFT_KEY = "ndi-acc-draft";

interface Draft {
  kind: Kind;
  orgId: string;
  legalName: string;
  officerEmail: string;
  capability: AccCapability;
  purpose: string;
  agreementRef: string;
  ask: AskItem[];
  issue: IssueType[];
}

export function ProposeAccreditationView() {
  const router = useRouter();
  const { organizations, accreditations, people, currentPerson, harness, proposeAccreditation, hydrated } = useDemo();
  const forced = useScreenState("SCR-ACC-01", [
    "live",
    "default",
    "recognition",
    "empty",
    "error",
    "overlap",
    "success",
    "offline",
    "no_permission",
  ]) as Face;

  /* Read once from the address — see ResponsibilityView for why not
     useSearchParams. `org:capability` from the recognition list. */
  const [recognise, setRecognise] = useState<{ orgId: string; capability: AccCapability } | null | undefined>(undefined);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("recognise");
    const [orgId, cap] = raw?.split(":") ?? [];
    setRecognise(orgId && (cap === "verifier" || cap === "issuer") ? { orgId, capability: cap } : null);
  }, []);

  const [draft, setDraft] = useState<Draft>({
    kind: "EXISTING",
    orgId: "",
    legalName: "",
    officerEmail: "",
    capability: "verifier",
    purpose: "",
    agreementRef: "",
    ask: [],
    issue: [],
  });
  const [replaces, setReplaces] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<"E10" | "E12" | "invalid" | "offline" | null>(null);
  const [saved, setSaved] = useState<"saved" | "resumed" | null>(null);
  const [proposedId, setProposedId] = useState<string | null>(null);

  /* The forced faces fill the form so each can be reviewed without typing. */
  const observedFor = (orgId: string, capability: AccCapability) =>
    OBSERVED_OPERATORS.find((o) => o.orgId === orgId && o.capability === capability);
  const recognising = forced === "recognition" ? { orgId: "org-bob", capability: "verifier" as const } : recognise;
  useEffect(() => {
    if (recognising === undefined) return;
    if (recognising) {
      const o = observedFor(recognising.orgId, recognising.capability);
      if (o)
        setDraft((d) => ({
          ...d,
          kind: "EXISTING",
          orgId: o.orgId,
          capability: o.capability,
          purpose: o.suggestedPurpose,
          ask: o.ask,
          issue: o.issue,
        }));
      return;
    }
    if (forced === "overlap") {
      setDraft((d) => ({
        ...d,
        kind: "NEW",
        legalName: "Bhutan Telecom Ltd.",
        officerEmail: "digital@bt.bt",
        capability: "issuer",
        purpose: "Proving which person a mobile number is registered to",
        issue: [{ name: "SIM registration", basis: "Telecommunications licence — the operator registers its subscribers" }],
      }));
      return;
    }
    /* Save and resume: a per-browser convenience, never shared state. */
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setDraft(JSON.parse(raw) as Draft);
        setSaved("resumed");
      }
    } catch {
      /* Nothing to resume. */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recognising?.orgId, recognising?.capability, recognising === undefined, forced]);

  const face: Face =
    forced !== "live"
      ? forced
      : proposedId
        ? "success"
        : !isNamedAdmin(currentPerson)
          ? "no_permission"
          : recognise
            ? "recognition"
            : "default";
  const isRecognition = face === "recognition" || Boolean(recognise);
  const observed = recognising ? observedFor(recognising.orgId, recognising.capability) : undefined;

  const orgs = organizations.filter((o) => o.id !== NDI_ORG);
  const org = organizations.find((o) => o.id === draft.orgId);
  const orgName = draft.kind === "NEW" ? draft.legalName.trim() || "The organisation" : org?.name ?? "The organisation";
  const standing =
    draft.kind === "EXISTING"
      ? accreditations.find((a) => a.orgId === draft.orgId && a.capability === draft.capability && accInProgress(a))
      : undefined;
  const showE10 = face === "error" || error === "E10";
  const overlaps = issueOverlaps(
    { orgId: draft.kind === "EXISTING" ? draft.orgId : null, issue: draft.issue },
    accreditations,
    (id) => organizations.find((o) => o.id === id)?.name ?? id,
  );
  const otherAdmins = people.filter((p) => isNamedAdmin(p) && p.hasAccount !== false && p.id !== harness.persona);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setError(null);
  };

  const ready =
    (draft.kind === "EXISTING" ? Boolean(draft.orgId) : Boolean(draft.legalName.trim() && /\S+@\S+\.\S+/.test(draft.officerEmail))) &&
    Boolean(draft.purpose.trim()) &&
    (draft.capability === "verifier" ? draft.ask.length > 0 : draft.issue.length > 0);

  const propose = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      /* Offline: nothing proposed, and the entry stays where it is. */
      if (face === "offline") {
        setError("offline");
        return;
      }
      const r = proposeAccreditation({
        door: isRecognition ? "RECOGNITION" : draft.kind,
        orgId: draft.kind === "EXISTING" ? draft.orgId : null,
        orgName: draft.kind === "EXISTING" ? org?.legalName ?? org?.name ?? "" : draft.legalName,
        officerEmail: draft.kind === "NEW" ? draft.officerEmail.trim() : null,
        capability: draft.capability,
        purpose: draft.purpose,
        agreementRef: draft.agreementRef,
        ask: draft.capability === "verifier" ? draft.ask : [],
        issue: draft.capability === "issuer" ? draft.issue : [],
        replaces,
      });
      if (r.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* Nothing saved. */
        }
        setProposedId(r.id);
      } else setError(r.error === "E10" || r.error === "E12" ? r.error : "invalid");
    }, LOCAL_MS);
  };

  if (!hydrated || recognise === undefined) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Accreditations", href: "/admin/accreditations" }, { label: "Propose" }]}
      title="Propose an accreditation"
    />
  );

  if (face === "no_permission") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <p role="status" className="relative z-[4] m-0 text-[14px] text-body">
              {currentPerson.platformRole === "root"
                ? "The root account doesn't propose or approve accreditations. NDI's platform administrators do, and each needs a second one to approve it."
                : "Only NDI\u2019s platform administrators can propose an accreditation."}
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 text-[14px] text-body">No unapproved organisations have been seen verifying or issuing.</p>
              <div>
                <HairlineButton onClick={() => router.push("/admin/accreditations")}>Back to accreditations</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "success") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 flex items-center gap-2 font-display text-[17px] font-semibold text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} className="text-accent" />
                Proposed
              </p>
              <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">
                A different administrator has to approve this before anything happens.
                {otherAdmins.length ? ` ${otherAdmins.map((p) => p.name).join(" or ")} can.` : ""} It lapses if
                nobody decides within 30 days.
              </p>
              <div>
                <GradientButton onClick={() => router.push("/admin/accreditations")}>Go to pending list</GradientButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
        {header}
        {saved === "resumed" ? (
          <p role="status" className="m-0 text-[13px] text-muted">
            Picked up where you left off.
          </p>
        ) : null}

        {isRecognition && observed ? (
          <p
            className="m-0 max-w-[80ch] rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body"
            style={{ background: "rgb(var(--tint) / 0.04)" }}
          >
            Seen since {formatDate(observed.since)}:{" "}
            {observed.capability === "verifier"
              ? observed.ask.map((a) => inline(a.item)).join(", ")
              : observed.issue.map((t) => t.name).join(", ")}
            . Remove anything its purpose doesn&rsquo;t need — after {formatDate(ENFORCEMENT_DATE)} it will be refused.
          </p>
        ) : null}

        <div className="grid items-start gap-5 min-[1001px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Panel>
            <form
              className="relative z-[4] flex flex-col gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (ready && !busy) propose();
              }}
            >
              {!isRecognition ? (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Who</span>
                  <SegmentedControl
                    label="Who the accreditation is for"
                    value={draft.kind}
                    onChange={(v) => set("kind", v)}
                    segments={[
                      { value: "EXISTING", label: "Already on the platform" },
                      { value: "NEW", label: "Not on the platform yet" },
                    ]}
                  />
                </div>
              ) : null}

              {draft.kind === "EXISTING" ? (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Organisation</span>
                  <Select
                    label="Organisation"
                    value={draft.orgId}
                    onChange={(v) => set("orgId", v)}
                    options={orgs.map((o) => ({ value: o.id, label: o.name }))}
                    placeholder="Choose an organisation"
                    disabled={isRecognition}
                  />
                </div>
              ) : (
                <div className="grid gap-4 min-[761px]:grid-cols-2">
                  <label className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>Legal name</span>
                    <input className={`${FIELD_CLASS} h-11`} value={draft.legalName} onChange={(e) => set("legalName", e.target.value)} />
                  </label>
                  <label className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>Officer&rsquo;s email</span>
                    <input
                      type="email"
                      className={`${FIELD_CLASS} h-11`}
                      value={draft.officerEmail}
                      onChange={(e) => set("officerEmail", e.target.value)}
                    />
                    <span className="text-[12.5px] leading-[1.5] text-faint">
                      They&rsquo;re invited to register the organisation, then accept.
                    </span>
                  </label>
                </div>
              )}

              {!isRecognition ? (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Approve it to</span>
                  <SegmentedControl
                    label="Capability"
                    value={draft.capability}
                    onChange={(v) => set("capability", v)}
                    segments={[
                      { value: "verifier", label: "Verify" },
                      { value: "issuer", label: "Issue" },
                    ]}
                  />
                </div>
              ) : null}

              {showE10 ? (
                <div role="alert" className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                    {standing?.orgName ?? orgName} already has {draft.capability === "verifier" ? "a verifier" : "an issuer"} approval.
                    Propose a replacement instead.
                  </p>
                  {standing?.state === "ACTIVE" || face === "error" ? (
                    <div>
                      <HairlineButton
                        onClick={() => {
                          setReplaces(standing?.id ?? null);
                          setError(null);
                        }}
                      >
                        Propose a replacement
                      </HairlineButton>
                    </div>
                  ) : (
                    <p className="m-0 text-[12.5px] text-muted">It&rsquo;s still in progress — finish or end that one first.</p>
                  )}
                </div>
              ) : replaces ? (
                <p className="m-0 text-[13px] text-muted">This replaces its current approval once it&rsquo;s accepted and listed.</p>
              ) : null}

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Purpose</span>
                <textarea
                  className={`${FIELD_CLASS} resize-y py-3`}
                  rows={2}
                  value={draft.purpose}
                  onChange={(e) => set("purpose", e.target.value)}
                  placeholder="What it needs this for, specifically"
                />
              </label>

              {draft.capability === "verifier" ? (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>What it can ask people for</span>
                  <ItemChooser value={draft.ask} onChange={(v) => set("ask", v)} observed={isRecognition ? observed?.ask : undefined} />
                </div>
              ) : (
                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>What it can issue</span>
                  <IssueTypesEditor value={draft.issue} onChange={(v) => set("issue", v)} />
                  {overlaps.length || face === "overlap" ? (
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {overlaps.map((o) => (
                        <li key={o.type} className="flex items-start gap-2 text-[13px] leading-[1.55] text-muted">
                          <Icon name="info" size={14} strokeWidth={2} className="mt-[3px] flex-none text-faint" />
                          {o.type} is also issued by {o.others.join(", ")}. Keep it if several issuers are intended.
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Agreement with NDI</span>
                <input
                  className={`${FIELD_CLASS} h-11`}
                  value={draft.agreementRef}
                  onChange={(e) => set("agreementRef", e.target.value)}
                  placeholder="Reference, for example NDI/AGR/2026/014"
                />
              </label>

              {error === "offline" ? (
                <p role="alert" className="m-0 text-[13.5px] text-body">
                  You&rsquo;re offline. Nothing was proposed, and what you entered is still here — try again
                  when you&rsquo;re back.
                </p>
              ) : error === "E12" ? (
                <p role="alert" className="m-0 text-[13.5px] text-body">
                  This needs a second administrator to approve it, and only one is active. Nothing was
                  proposed — try again once another administrator has joined.
                </p>
              ) : error === "invalid" ? (
                <p role="alert" className="m-0 text-[13.5px] text-body">
                  Something&rsquo;s missing: the organisation, its purpose, and at least one thing it can{" "}
                  {draft.capability === "verifier" ? "ask for" : "issue"}.
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2.5">
                <GradientButton type="submit" disabled={!ready || busy || showE10}>
                  {busy ? "Proposing…" : "Propose"}
                </GradientButton>
                <HairlineButton
                  onClick={() => {
                    try {
                      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                      setSaved("saved");
                    } catch {
                      /* Storage unavailable: nothing saved, and the form says nothing it can't keep. */
                    }
                  }}
                >
                  Save and resume later
                </HairlineButton>
                <HairlineButton onClick={() => router.push("/admin/accreditations")}>Cancel</HairlineButton>
                {saved === "saved" ? (
                  <span role="status" className="text-[12.5px] text-muted">
                    Saved in this browser.
                  </span>
                ) : null}
              </div>
            </form>
          </Panel>

          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" aria-live="polite">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What this will mean</h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                {scopeSentence(orgName, draft.capability, draft.ask, draft.issue)}
              </p>
              {isRecognition && observed && draft.capability === "verifier" ? (
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  {observed.ask.filter((o) => !draft.ask.some((a) => sameItem(a, o))).length
                    ? `Removed from what it was seen asking for: ${observed.ask
                        .filter((o) => !draft.ask.some((a) => sameItem(a, o)))
                        .map((a) => inline(a.item))
                        .join(", ")}.`
                    : "Everything it was seen asking for is still included."}
                </p>
              ) : null}
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                Once accepted, {orgName} is added to NDI&rsquo;s public list of trusted organisations.
              </p>
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                A different administrator has to approve this before anything happens.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
