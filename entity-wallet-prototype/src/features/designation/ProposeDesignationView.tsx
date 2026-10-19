"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { NDI_ORG, PELDEN, isNamedAdmin, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { kindPlural, kindSingular, kindTitle } from "./shared";

/**
 * SCR-DSG-01 — Propose a designation. FLOW-ORG-02 A1 (Kind E): an
 * organisation already on the platform, made the foundational issuer for
 * some entity types.
 *
 * THE SCOPE IS SAID BEFORE IT IS PROPOSED
 *
 * The summary under the form says, in outcome words, what the organisation
 * will be able to do — "issue the credential that makes a sole
 * proprietorship real on the platform. Nothing else." — and changes as the
 * types are ticked. Then the two things that are easy to learn too late:
 * once switched on the scope can't be edited (EW-FLOW5-SD/D6), and a
 * different administrator has to approve it before anything happens.
 *
 * A type another authority already confirms is shown, not hidden, and
 * can't be ticked: proposing it would only fail at activation (E5), and
 * superseding an incumbent is its own act with its own approval.
 *
 * SAVE AND RESUME
 *
 * A proposal interrupted and resumed doesn't ask again for what was
 * already given (SC 3.3.7). The draft is kept in this browser only.
 */
type Face = "live" | "default" | "loading" | "error" | "success" | "offline" | "no_permission";

const DRAFT_KEY = "ndi-designation-draft";
interface Draft {
  orgId: string;
  kinds: OrgKind[];
  legalBasis: string;
  legalRef: string;
}
const BLANK: Draft = { orgId: "org-moice", kinds: [], legalBasis: "", legalRef: "" };

export function ProposeDesignationView() {
  const router = useRouter();
  const { organizations, designations, currentPerson, proposeDesignation, hydrated } = useDemo();
  const forced = useScreenState("SCR-DSG-01", ["live", "default", "loading", "error", "success", "offline", "no_permission"]) as Face;

  const [draft, setDraft] = useState<Draft>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<"org" | "kinds" | "basis" | "form", string>>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState<"saved" | "resumed" | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        setDraft(JSON.parse(raw) as Draft);
        setSaved("resumed");
      }
    } catch {
      /* Nothing to resume. */
    }
  }, []);

  const face: Face =
    forced !== "live" ? forced : done ? "success" : !isNamedAdmin(currentPerson) ? "no_permission" : busy ? "loading" : "default";

  /* Organisations that could become an authority: on the platform, not
     NDI, not a business that holds its own wallet for itself. */
  const candidates = organizations.filter((o) => o.id !== NDI_ORG && o.id !== PELDEN && o.id !== "org-bob" && o.id !== "org-tashicell");
  const org = organizations.find((o) => o.id === draft.orgId);
  const covered = (k: OrgKind) =>
    designations.find((d) => d.state === "ACTIVE" && d.orgId !== draft.orgId && d.entityTypes.includes(k));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors({});
    setSaved(null);
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!org) next.org = "Choose the organisation.";
    if (!draft.kinds.length) next.kinds = "Choose at least one kind of business it will confirm.";
    if (!draft.legalBasis.trim()) next.basis = "Give the legal basis for the designation.";
    setErrors(next);
    if (Object.keys(next).length) return;
    if (forced === "offline") {
      setErrors({ form: "offline" });
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const r = proposeDesignation({ orgId: draft.orgId, entityTypes: draft.kinds, legalBasis: draft.legalBasis, legalRef: draft.legalRef });
      setBusy(false);
      if (r.ok) {
        try {
          window.sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          /* Fine. */
        }
        setDone(true);
      } else {
        setErrors({ form: r.error });
      }
    }, LOCAL_MS);
  };

  const header = (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Designations", href: "/admin/designations" }, { label: "Propose" }]}
      title="Propose a designation"
    />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (face === "no_permission") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <p role="status" className="relative z-[4] m-0 text-[14px] text-body">
              {currentPerson.platformRole === "root"
                ? "The root account doesn't propose or approve designations. NDI's platform administrators do, and each needs a second one to approve it."
                : "Only NDI’s platform administrators can propose a designation."}
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "success") {
    const name = org?.legalName ?? org?.name ?? "The organisation";
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-center gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} style={{ color: "var(--ndi-success)" }} />
                Proposed. A different administrator has to approve it.
              </p>
              <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-muted">
                Nothing has happened for {name} yet. After a second administrator approves it,{" "}
                {name} is asked to accept it, and has 30 days to.
              </p>
              <div>
                <GradientButton onClick={() => router.push("/admin/designations")}>Go to pending list</GradientButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const fieldError = (msg?: string, id?: string) =>
    msg ? (
      <span id={id} role="alert" className="text-[12.5px]" style={{ color: "var(--text-danger)" }}>
        {msg}
      </span>
    ) : null;
  const name = org?.legalName ?? org?.name ?? "This organisation";
  const showError = face === "error" || Boolean(errors.form && errors.form !== "offline");

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {saved === "resumed" ? (
          <p role="status" className="m-0 text-[13px] text-muted">
            Picked up where you left off.
          </p>
        ) : null}
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
              <Select
                label="Organisation"
                value={draft.orgId}
                onChange={(v) => set("orgId", v)}
                options={candidates.map((o) => ({ value: o.id, label: o.legalName ?? o.name }))}
              />
              {fieldError(errors.org, "err-org")}
              <span className="text-[12.5px] leading-[1.5] text-faint">
                An organisation already on the platform. Its own officer will be asked to accept.
              </span>
            </div>

            <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0" aria-describedby={errors.kinds ? "err-kinds" : undefined}>
              <legend className={`${LABEL_CLASS} mb-1`}>It will confirm</legend>
              {(["sole_proprietorship", "partnership", "company"] as OrgKind[]).map((k) => {
                const incumbent = covered(k);
                return (
                  <Checkbox
                    key={k}
                    checked={draft.kinds.includes(k)}
                    disabled={Boolean(incumbent)}
                    onChange={(on) => set("kinds", on ? [...draft.kinds, k] : draft.kinds.filter((x) => x !== k))}
                    label={kindTitle(k)}
                    description={
                      incumbent
                        ? `${incumbent.orgName} already confirms ${kindPlural(k)}. That designation has to be superseded first.`
                        : undefined
                    }
                  />
                );
              })}
              {fieldError(errors.kinds, "err-kinds")}
            </fieldset>

            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Legal basis</span>
              <input
                className={FIELD_CLASS}
                value={draft.legalBasis}
                onChange={(e) => set("legalBasis", e.target.value)}
                placeholder="For example, the licensing of businesses under the Ministry's mandate"
                aria-invalid={Boolean(errors.basis)}
                aria-describedby={errors.basis ? "err-basis" : undefined}
              />
              {fieldError(errors.basis, "err-basis")}
            </label>
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Reference (optional)</span>
              <input
                className={FIELD_CLASS}
                value={draft.legalRef}
                onChange={(e) => set("legalRef", e.target.value)}
                placeholder="Reference, for example NDI/DSG/2026/002"
              />
            </label>

            <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body" aria-live="polite">
                {draft.kinds.length
                  ? `${name} will be able to issue the credential that makes a ${draft.kinds.map(kindSingular).join(" or a ")} real on the platform. Nothing else.`
                  : `Choose what ${name} will confirm.`}
              </p>
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                Once this is approved and switched on, the scope can&rsquo;t be edited. Widening it later
                means a new designation and a second approval.
              </p>
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                A different administrator has to approve this before anything happens.
              </p>
            </div>

            {errors.form === "offline" || face === "offline" ? (
              <p role="alert" className="m-0 text-[13.5px] text-body">
                You&rsquo;re offline. Nothing was proposed, and what you entered is still here — try again
                when you&rsquo;re back.
              </p>
            ) : null}
            {showError ? (
              <p role="alert" className="m-0 text-[13.5px] text-body">
                {errors.form === "E12"
                  ? "This needs a second administrator to approve it, and only one is active. Nothing was proposed."
                  : errors.form === "exists"
                    ? `${name} already has a designation on its way or in force.`
                    : "Nothing was proposed. Check the fields above and try again."}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-2.5">
              <GradientButton type="submit" disabled={busy}>
                {busy ? "Proposing…" : "Propose"}
              </GradientButton>
              <HairlineButton
                type="button"
                onClick={() => {
                  try {
                    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
                    setSaved("saved");
                  } catch {
                    /* Nothing to do. */
                  }
                }}
              >
                Save and finish later
              </HairlineButton>
              <HairlineButton type="button" onClick={() => router.push("/admin/designations")}>
                Cancel
              </HairlineButton>
              {saved === "saved" ? (
                <span role="status" className="text-[12.5px] text-muted">
                  Saved in this browser.
                </span>
              ) : null}
            </div>
          </form>
        </Panel>
      </div>
    </AppShell>
  );
}
