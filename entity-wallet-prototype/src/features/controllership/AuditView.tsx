"use client";

import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DualAttribution } from "@/components/ui/DualAttribution";
import { EmptyState } from "@/components/ui/EmptyState";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * C6 — the record. Append-only, dual-attributed, and exportable as evidence.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * No disclosed values, anywhere. A row records that five attributes went to
 * Bank of Bhutan and keeps a fingerprint of them; it does not keep the
 * attributes. An audit trail that stored what it was protecting would be a
 * second copy of the entity's data with a longer retention period than the
 * original — the single worst thing this feature could turn into.
 *
 * No edit, no delete, not even for an owner. The value of the trail is that
 * nobody can change it, so there is no affordance suggesting otherwise. The
 * chain of fingerprints is what makes that claim checkable rather than a
 * promise: each row commits to the one before it, so a removed or altered row
 * breaks every row after it.
 *
 * WHY EVERY ROW SHOWS TWO NAMES
 *
 * This is where dual attribution earns its keep. "Pelden Trading, acted by
 * Rinzin Dema, approved by Dorji Wangchuk" answers the three questions an
 * investigation actually asks — on whose behalf, by whose hand, on whose
 * authority — and no single-name log can answer any of them.
 */
export function AuditView() {
  const { auditEntries, personById } = useDemo();

  const screenState = useScreenState("C6", ["populated", "filtered_empty", "empty"]);

  const [filter, setFilter] = useState<string>("all");
  const [exported, setExported] = useState(false);

  const operations = [...new Set(auditEntries.map((e) => e.operation))].sort();

  const rows =
    screenState === "empty"
      ? []
      : screenState === "filtered_empty"
        ? []
        : filter === "all"
          ? auditEntries
          : auditEntries.filter((e) => e.operation === filter);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Who can act" }, { label: "Audit" }]}
          title="The record"
          actions={
            <StatusPill status="verified" label={`Chain intact · ${auditEntries.length} entries`} />
          }
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Every action taken for Pelden Trading, in the order it happened.
          Nothing here can be changed or removed, including by the owner. Each
          entry commits to the one before it, so an altered entry would break
          everything after it.
        </p>

        {/* ---- Filter and export ---- */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("all")}
              aria-pressed={filter === "all"}
              className="ndi-navrow rounded-full px-3 py-1.5 text-[12.5px] font-medium"
              data-active={filter === "all" ? "1" : "0"}
            >
              Everything
            </button>
            {operations.map((operation) => (
              <button
                key={operation}
                type="button"
                onClick={() => setFilter(operation)}
                aria-pressed={filter === operation}
                className="ndi-navrow rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                data-active={filter === operation ? "1" : "0"}
              >
                {operation.replace(/:/g, " · ")}
              </button>
            ))}
          </div>

          <HairlineButton onClick={() => setExported(true)}>
            <Icon name="download" size={14} strokeWidth={2} />
            Export evidence
          </HairlineButton>
        </div>

        {exported ? (
          <p
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-xl border border-grid bg-[var(--ndi-mint-08)] px-3.5 py-3 text-[13px] leading-[1.5] text-accent"
          >
            <Icon name="check" size={14} strokeWidth={2.2} className="mt-px flex-none" />
            <span>
              An evidence bundle would be prepared here — the entries, their
              fingerprints, and the approval records behind them, in a form a
              third party can check without access to this console.
            </span>
          </p>
        ) : null}

        {rows.length === 0 ? (
          <Panel padded={false}>
            <EmptyState
              icon="fileText"
              tone={screenState === "filtered_empty" ? "filtered" : undefined}
              title={
                screenState === "filtered_empty"
                  ? "Nothing matches that filter"
                  : "Nothing recorded yet"
              }
              message={
                screenState === "filtered_empty"
                  ? "No entries of that kind. The record itself is intact — this is only what the filter found."
                  : "The first entry appears when the entity accepts its foundational credential."
              }
            />
          </Panel>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((entry) => (
              <Panel key={entry.id}>
                <div className="relative z-[4] flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          #{entry.seq} · {entry.operation.replace(/:/g, " · ")}
                        </span>
                      </div>
                      <p className="font-display text-[14px] font-medium leading-[1.4] text-body">
                        {entry.summary}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-[12px] text-faint">
                      {entry.at.slice(0, 10)} · {entry.at.slice(11, 16)}
                    </span>
                  </div>

                  {/* The point of the whole screen. */}
                  <DualAttribution
                    entity={entry.entity}
                    actorId={entry.actorId}
                    approvedById={entry.approvedById}
                    size="compact"
                  />

                  <dl className="m-0 grid gap-x-6 gap-y-1.5 border-t border-subtle pt-3 min-[641px]:grid-cols-2">
                    {entry.scopeVersion !== null ? (
                      <Row label="Scope matched" value={`Version ${entry.scopeVersion}`} />
                    ) : null}
                    {entry.relationId ? (
                      <Row label="Under authority" value={entry.relationId} mono />
                    ) : null}
                    {entry.relyingPartyDid ? (
                      <Row label="Relying party" value={entry.relyingPartyDid} mono />
                    ) : null}
                    {entry.disclosedDigest ? (
                      <Row
                        label="Disclosed"
                        value={`${entry.disclosedDigest} — fingerprint only`}
                        mono
                      />
                    ) : null}
                    <Row label="This entry" value={entry.rowHash} mono />
                    <Row label="Commits to" value={entry.prevHash} mono />
                  </dl>

                  {entry.approvedById ? (
                    <p className="text-[12.5px] leading-[1.5] text-faint">
                      {personById(entry.approvedById).name} authorised this before it
                      ran. That approval is part of the record, not a separate
                      log.
                    </p>
                  ) : null}
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[12px] text-faint">{label}</dt>
      <dd
        className={`m-0 break-all text-[12.5px] text-muted ${mono ? "font-mono text-[11.5px]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
