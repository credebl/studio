"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { isNamedAdmin, roleIn, type ActivationCheck, type Designation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { CheckList, kindPlural, kindsInWords } from "./shared";

/**
 * SCR-DSG-04 — Activation result. FLOW-ORG-02 step 3: turn a failed
 * activation into a specific action by a specific person (UN-19, UC-14).
 *
 * THE ONE SCREEN WHERE THE MECHANISM IS NAMED
 *
 * Everywhere else the authority reads outcomes. Here an engineer has to act
 * — add a did:ethr identity, grant an entitlement — and obscuring the
 * method would make the screen useless (UXD-19). So each failing check
 * shows what was observed and who resolves it: the organisation (its
 * identity, its set-up) or NDI (entitlements, an incumbent). E3's last
 * sentence — they add it themselves, NDI can't — isn't a disclaimer: it is
 * EW-FLOW5-SD/D12 made operational, and it stops NDI being asked to do the
 * one thing it must not.
 *
 * PASS AND FAIL NEVER BY COLOUR ALONE
 *
 * Every check carries the word Passed or Failed (SC 1.4.1), and the result
 * is announced to assistive technology (SC 4.1.3).
 *
 * SUCCESS IS NOT "WORKING"
 *
 * Switched on means designated, and nothing live: the success copy says so,
 * because "activated" is easily read as "businesses can verify now".
 *
 * Readable by the authority's OWNER too, for the checks they must resolve;
 * only an NDI administrator re-runs.
 */
type Face = "live" | "default" | "loading" | "e1" | "e2" | "e3" | "e3_unseeded" | "e4" | "e5" | "success" | "offline";

const SAMPLE: Designation = {
  id: "sample",
  orgId: "org-moice",
  orgName: "Ministry of Industry, Commerce & Employment",
  kind: "E",
  entityTypes: ["sole_proprietorship", "partnership"],
  legalBasis: "",
  legalRef: "",
  state: "ACCEPTED",
  proposedBy: "tshering",
  proposedAt: null,
  approvedBy: "tshendu",
  approvedAt: null,
  acceptedBy: "kesang",
  acceptedAt: null,
  refusedReason: null,
  expiresAt: null,
  activatedAt: null,
  didMethodAtActivation: null,
  checks: null,
  checkedAt: null,
  ndiAccess: "ACTIVE",
  ndiAccessChangedBy: null,
  ndiAccessChangedAt: null,
};

/** A full set of checks with one failing, for the forced error faces. */
function forcedChecks(fail: ActivationCheck["error"]): ActivationCheck[] {
  const base: ActivationCheck[] = [
    { id: "P2", label: "Accepted by the organisation", pass: true, observed: null, resolver: null, error: null },
    { id: "P3", label: "Organisation set up — agent and wallet", pass: true, observed: null, resolver: null, error: null },
    { id: "P4", label: "Issuing identity is did:ethr on the national network", pass: true, observed: null, resolver: null, error: null },
    { id: "P5", label: "Entitlements: schema creation, issuance, verification", pass: true, observed: null, resolver: null, error: null },
    { id: "P6", label: "No other foundational issuer for these entity types", pass: true, observed: null, resolver: null, error: null },
  ];
  const at = { E1: 0, E2: 1, E3: 2, E4: 3, E5: 4 }[fail ?? "E1"];
  const observed = { E1: "Not accepted yet", E2: "No agent or wallet", E3: "did:key", E4: "schemaCreate", E5: "Corporate Regulatory Authority" }[fail ?? "E1"];
  base[at] = { ...base[at], pass: false, observed, error: fail, resolver: fail === "E4" || fail === "E5" ? "NDI" : "authority" };
  return base;
}

export function ActivationResultView({ id }: { id: string }) {
  const router = useRouter();
  const { designations, organizations, currentPerson, rerunActivation, grantEntitlements, hydrated } = useDemo();
  const forced = useScreenState("SCR-DSG-04", [
    "live",
    "default",
    "loading",
    "e1",
    "e2",
    "e3",
    "e3_unseeded",
    "e4",
    "e5",
    "success",
    "offline",
  ]) as Face;

  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const live = designations.find((x) => x.id === id);
  const d: Designation = live ?? SAMPLE;
  const org = organizations.find((o) => o.id === d.orgId);
  const admin = isNamedAdmin(currentPerson);
  const owner = org ? roleIn(org, currentPerson) === "Owner" : false;

  const forcedFail: ActivationCheck["error"] | null =
    forced === "e1" ? "E1" : forced === "e2" ? "E2" : forced === "e3" || forced === "e3_unseeded" ? "E3" : forced === "e4" ? "E4" : forced === "e5" ? "E5" : null;
  const checks: ActivationCheck[] | null = forcedFail
    ? forcedChecks(forcedFail)
    : forced === "default" || forced === "success"
      ? forcedChecks(null).map((c) => ({ ...c, pass: true, observed: null, resolver: null, error: null }))
      : d.checks;
  const failing = (checks ?? []).filter((c) => !c.pass);
  const active = forced === "success" || (forced === "live" && d.state === "ACTIVE");
  const face: Face = forced === "live" ? (running ? "loading" : active ? "success" : "default") : forced;
  const offline = face === "offline";

  const header = (
    <PageHeader
      crumbs={[
        { label: admin ? "NDI administration" : d.orgName },
        ...(admin ? [{ label: "Designations", href: "/admin/designations" }] : []),
        { label: "Activation" },
      ]}
      title="Activation result"
    />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!admin && !owner) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
          {header}
          <Panel>
            <p role="status" className="relative z-[4] m-0 text-[14px] text-body">
              {currentPerson.platformRole === "root"
                ? "The root account doesn't run activation. NDI's platform administrators do."
                : "This is for NDI's administrators and the organisation's owner."}
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const rerun = () => {
    setRunning(true);
    window.setTimeout(() => {
      rerunActivation(d.id);
      setRunning(false);
    }, ROUND_TRIP_MS);
  };

  /* What each failing check means, in SCR-DSG-04's words (UX-EW-02 §3.5). */
  const message = (c: ActivationCheck) => {
    switch (c.error) {
      case "E1":
        return `This designation is waiting for ${d.orgName} to accept it.`;
      case "E2":
        return `${d.orgName} hasn't finished setting up. They need to complete that before this can be switched on.`;
      case "E3":
        return forced === "e3_unseeded"
          ? `This organisation's issuing identity is on a network we can't resolve (did:ethr:unseeded). Don't activate — this will fail later, at issuance, looking like something else.`
          : `This organisation's issuing identity is ${c.observed}. A foundational issuer has to use did:ethr on the national network. ${d.orgName} adds this themselves — NDI can't do it for them.`;
      case "E4":
        return `${d.orgName} is missing: ${c.observed}. NDI grants these.`;
      case "E5":
        return `${c.observed} is already the foundational issuer for ${kindPlural(d.entityTypes[0] ?? "company")}. That designation has to be superseded first.`;
      default:
        return null;
    }
  };

  const copyDetails = () => {
    const text = [
      `Activation checks for ${d.orgName}${d.checkedAt ? ` (${d.checkedAt})` : ""}:`,
      ...(checks ?? []).map((c) => `${c.pass ? "Passed" : "Failed"} — ${c.label}${c.pass ? "" : `. Observed: ${c.observed}. Resolved by ${c.resolver === "NDI" ? "NDI" : "the organisation"}.`}`),
    ].join("\n");
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      /* Copying is a convenience; the details are on screen. */
    }
    setCopied(true);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        {header}
        <p className="m-0 max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          {d.orgName} · {kindsInWords(d.entityTypes)}. Before it switches on, NDI checks the organisation
          can actually do this. Each check says who resolves it if it fails.
        </p>

        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            The checks couldn&rsquo;t run. Nothing has changed — the designation stays pending. Try again
            when you&rsquo;re back.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4" aria-live="polite">
            {face === "loading" ? (
              <p role="status" className="m-0 text-[14px] text-body">
                Running the checks…
              </p>
            ) : face === "success" ? (
              <p role="status" className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                {d.orgName} is designated. Nothing is live yet — they need to agree what people will be asked,
                for each kind of business.
              </p>
            ) : failing.length ? (
              <p role="status" className="m-0 text-[14px] text-body">
                {failing.length === 1 ? "One check failed." : `${failing.length} checks failed.`} Nothing has been switched on.
              </p>
            ) : checks ? (
              <p role="status" className="m-0 text-[14px] text-body">
                Every check passes.
              </p>
            ) : (
              <p role="status" className="m-0 text-[14px] text-body">
                The checks haven&rsquo;t run yet. They run when the organisation accepts.
              </p>
            )}

            {checks && face !== "loading" ? <CheckList checks={checks} /> : null}

            {failing.map((c) => (
              <div key={c.id} role="alert" className="flex flex-col gap-1.5 rounded-[12px] border px-4 py-3" style={{ borderColor: "var(--ndi-danger)" }}>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">{message(c)}</p>
                {c.error === "E4" && admin ? (
                  <div>
                    <HairlineButton
                      disabled={offline || running}
                      onClick={() => grantEntitlements(d.orgId)}
                    >
                      Grant them
                    </HairlineButton>
                  </div>
                ) : null}
                {c.error === "E1" ? (
                  <Link className="ndi-plainlink text-[12.5px] font-medium text-accent" href={`/admin/designations/${d.id}`}>
                    View the acceptance status
                  </Link>
                ) : null}
              </div>
            ))}

            {d.checkedAt && face !== "loading" ? (
              <p className="m-0 text-[12.5px] text-faint">Last run {formatDate(d.checkedAt)}.</p>
            ) : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              {face === "success" ? (
                <GradientButton onClick={() => router.push(admin ? "/admin/designations" : "/authority")}>Continue</GradientButton>
              ) : admin ? (
                <GradientButton onClick={rerun} disabled={offline || running}>
                  <Icon name="refresh" size={15} strokeWidth={2.2} />
                  {running ? "Running…" : "Re-run checks"}
                </GradientButton>
              ) : null}
              {failing.length ? (
                <HairlineButton onClick={copyDetails}>{copied ? "Copied" : "Copy details for the authority"}</HairlineButton>
              ) : null}
              {admin ? (
                <HairlineButton onClick={() => router.push(`/admin/designations/${d.id}`)}>View the designation</HairlineButton>
              ) : null}
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
