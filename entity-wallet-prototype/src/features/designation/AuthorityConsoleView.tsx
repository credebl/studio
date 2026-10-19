"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { roleIn, type Adoption, type Designation, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { daysLeft, dsgPill, kindTitle, kindsInWords } from "./shared";

/**
 * The authority console — SCR-DSG-05 (designation status) and SCR-ADO-03
 * (live in your name), two regions of one page (UXD-16).
 *
 * ONE PAGE FOR ONE QUESTION
 *
 * "What is happening in my organisation's name, and who can act in it" is
 * one question to an authority, so the designation, NDI's access and what
 * is live sit together. Splitting them across two pages would let an
 * officer check one and believe they had checked both.
 *
 * NDI'S ACCESS, NAMED WHEREVER IT APPEARS
 *
 * Its capability is stated and its removal is offered in the same place,
 * not only at acceptance (UN-24, UC-17) — and NDI's service account shows
 * in the members list, as SCR-DSG-03 promised it would.
 *
 * STOPS ARE SHOWN, NOT HIDDEN
 *
 * A stopped entity type stays on the page, with when and by whom, and the
 * sentence that it un-verified nobody (UXD-20). Superseded versions are kept
 * and reachable (UC-18).
 *
 * Anyone in the organisation may read it; only its OWNER acts, and someone
 * who isn't sees the actions disabled with the owner named.
 */
type Face = "live" | "default" | "loading" | "empty" | "error" | "offline" | "suspended" | "no_permission";

export function AuthorityConsoleView() {
  const router = useRouter();
  const { designations, adoptions, organizations, currentPerson, personById, activeOrgId, setNdiAccess, hydrated } = useDemo();
  const forced = useScreenState("SCR-DSG-05", ["live", "default", "loading", "empty", "error", "offline", "suspended", "no_permission"]) as Face;

  const [confirmAccess, setConfirmAccess] = useState<"remove" | "restore" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const org =
    organizations.find((o) => o.id === activeOrgId && designations.some((d) => d.orgId === o.id)) ??
    organizations.find((o) => o.memberIds.includes(currentPerson.id) && designations.some((d) => d.orgId === o.id));
  const mine = designations.filter((d) => d.orgId === org?.id);
  const d: Designation | undefined =
    mine.find((x) => ["ACTIVE", "SUSPENDED"].includes(x.state)) ?? mine.find((x) => ["PENDING", "ACCEPTED"].includes(x.state)) ?? mine[0];
  const owner = org ? roleIn(org, currentPerson) === "Owner" : false;
  const ownerId = org ? Object.entries(org.roles ?? {}).find(([, r]) => r === "Owner")?.[0] : undefined;
  const ownerName = ownerId ? personById(ownerId).name : "Your organisation's owner";

  const rows = (k: OrgKind) => adoptions.filter((a) => a.designationId === d?.id && a.entityType === k).sort((a, b) => b.version - a.version);
  const current = (k: OrgKind): Adoption | undefined => rows(k).find((a) => a.state === "ACTIVE") ?? rows(k).find((a) => a.state === "WITHDRAWN");
  const anyLive = d ? d.entityTypes.some((k) => current(k)?.state === "ACTIVE") : false;

  const natural: Face = !d ? "empty" : d.state === "SUSPENDED" ? "suspended" : !owner ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const offline = face === "offline";
  const canAct = owner && !offline && face !== "no_permission" && face !== "suspended";

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader
      crumbs={[{ label: org?.name ?? "Your organisation" }, { label: "Authority" }]}
      title="Your authority"
      actions={
        d?.state === "ACTIVE" && anyLive ? (
          <HairlineButton onClick={() => router.push("/authority/stop")} disabled={!canAct}>
            Stop something
          </HairlineButton>
        ) : undefined
      }
    />
  );

  if (face === "error") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="alert" className="m-0 text-[14px] text-body">
                We couldn&rsquo;t show this. Nothing has changed.
              </p>
              <div>
                <HairlineButton onClick={() => router.refresh()}>Try again</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (!d) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="shieldCheck" title="Nothing is live in your name." message="Your organisation isn't designated to confirm any kind of business." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const pill = dsgPill(face === "suspended" ? { state: "SUSPENDED" } : d, "authority");
  const disabledReason = face === "no_permission" ? `Only ${ownerName}, who owns ${org?.name ?? "the organisation"} on the platform, can change this.` : null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        {header}

        {notice ? (
          <p role="status" className="m-0 flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body">
            <Icon name="check" size={14} strokeWidth={2.4} style={{ color: "var(--ndi-success)" }} />
            {notice}
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is how things stood when you were last connected; changes are
            switched off.
          </p>
        ) : null}
        {disabledReason ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {disabledReason}
          </p>
        ) : null}

        {/* ---- SCR-DSG-05 — Designation status ---- */}
        <section aria-labelledby="dsg-status" className="flex flex-col gap-3">
          <h2 id="dsg-status" className="m-0 font-display text-[16px] font-semibold text-strong">
            Your designation
          </h2>
          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">
                  {org?.name ?? d.orgName} is the authority that confirms {kindsInWords(d.entityTypes)} on the
                  platform.
                </p>
                <StatusPill status={pill.status} label={pill.label} />
              </div>

              {face === "suspended" ? (
                <p role="status" className="m-0 rounded-[12px] border px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
                  {org?.name ?? d.orgName}&rsquo;s issuing identity has changed since it was designated. New
                  verifications have stopped until this is put back. Businesses already verified are not
                  affected. Contact NDI if you need help putting it back.
                </p>
              ) : null}
              {d.state === "PENDING" ? (
                <p className="m-0 text-[13.5px] text-body">
                  NDI has proposed this, and it&rsquo;s waiting for you — {daysLeft(d.expiresAt)} days left.{" "}
                  <Link className="ndi-plainlink font-medium text-accent" href={`/designation/${d.id}`}>
                    Review it
                  </Link>
                </p>
              ) : null}
              {d.state === "ACCEPTED" ? (
                <p className="m-0 text-[13.5px] text-body">
                  You&rsquo;ve accepted. NDI is finishing switching it on.{" "}
                  {(d.checks ?? []).some((c) => !c.pass && c.resolver === "authority") ? (
                    <Link className="ndi-plainlink font-medium text-accent" href={`/admin/designations/${d.id}/activation`}>
                      Something here is yours to resolve
                    </Link>
                  ) : (
                    "Nothing is needed from you."
                  )}
                </p>
              ) : null}

              <DetailList
                items={[
                  { label: "Confirms", value: kindsInWords(d.entityTypes) },
                  {
                    label: "Proposed and approved",
                    value:
                      d.proposedBy && d.approvedBy
                        ? `${personById(d.proposedBy).name} and ${personById(d.approvedBy).name}, NDI`
                        : "By NDI, before the Entity Wallet opened",
                  },
                  ...(d.acceptedAt ? [{ label: "Accepted", value: `${d.acceptedBy ? `${personById(d.acceptedBy).name}, ` : ""}${formatDate(d.acceptedAt)}` }] : []),
                  ...(d.activatedAt ? [{ label: "Switched on", value: formatDate(d.activatedAt) }] : []),
                ]}
              />

              {d.state === "ACTIVE" || d.state === "SUSPENDED" ? (
                <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
                  <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">NDI&rsquo;s access</p>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                    {d.ndiAccess === "ACTIVE"
                      ? "NDI's service account can send the request you approved, in your name. Remove it and that stops immediately."
                      : "NDI's service account can no longer send in your name. Your designation and what you've agreed are unchanged."}
                  </p>
                  {d.ndiAccess === "REMOVED" && d.ndiAccessChangedAt ? (
                    <p className="m-0 text-[12.5px] text-faint">
                      Removed {formatDate(d.ndiAccessChangedAt)}
                      {d.ndiAccessChangedBy ? ` by ${personById(d.ndiAccessChangedBy).name}` : ""}.
                    </p>
                  ) : null}
                  <div>
                    <HairlineButton onClick={() => setConfirmAccess(d.ndiAccess === "ACTIVE" ? "remove" : "restore")} disabled={!canAct}>
                      {d.ndiAccess === "ACTIVE" ? "Remove NDI's access" : "Turn NDI's access back on"}
                    </HairlineButton>
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </section>

        {/* ---- SCR-ADO-03 — Live in your name ---- */}
        {d.state === "ACTIVE" || d.state === "SUSPENDED" ? (
          <section aria-labelledby="ado-live" className="flex flex-col gap-3">
            <h2 id="ado-live" className="m-0 font-display text-[16px] font-semibold text-strong">
              Live in your name
            </h2>
            {face === "empty" || !anyLive ? (
              <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-body">
                {face === "suspended"
                  ? "Your designation is suspended, so nothing is live at the moment. Businesses already verified are not affected."
                  : "You're designated, but nothing is live in your name yet. People can't verify with you until you agree what they'll be asked."}
              </p>
            ) : null}
            <Panel padded={false}>
              <ul className="relative z-[4] m-0 list-none p-0">
                {d.entityTypes.map((k, i) => {
                  const now = face === "empty" ? undefined : current(k);
                  const older = face === "empty" ? [] : rows(k).filter((a) => a.state === "SUPERSEDED");
                  return (
                    <li key={k} className={`flex flex-col gap-2 px-5 py-4 ${i > 0 ? "border-t border-subtle" : ""}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-[14px] font-medium text-body">{kindTitle(k)}</span>
                          <span className="text-[12.5px] text-muted">
                            {!now
                              ? "Not live — nothing adopted yet."
                              : now.state === "WITHDRAWN"
                                ? `Stopped on ${formatDate(now.stoppedAt ?? now.adoptedAt)} by ${now.stoppedBy ? personById(now.stoppedBy).name : "—"}. Businesses verified before then are not affected.`
                                : `${kindTitle(k)} — live since ${formatDate(now.adoptedAt)}, version ${now.version}, adopted by ${personById(now.adoptedBy).name}`}
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-2">
                          <StatusPill
                            status={!now ? "not_set_up" : now.state === "WITHDRAWN" ? "stopped" : "active"}
                            label={!now ? "Not live" : now.state === "WITHDRAWN" ? "Stopped" : "Live"}
                          />
                          {!now || now.state === "WITHDRAWN" ? (
                            <GradientButton onClick={() => router.push(`/authority/${k}`)} disabled={!canAct || d.state !== "ACTIVE"}>
                              {now ? "Adopt again" : "Review and adopt"}
                            </GradientButton>
                          ) : (
                            <HairlineButton onClick={() => router.push(`/authority/${k}`)}>View what people are asked</HairlineButton>
                          )}
                        </span>
                      </div>
                      {older.length ? (
                        <details className="text-[12.5px] text-muted">
                          <summary className="cursor-pointer">Earlier versions</summary>
                          <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
                            {older.map((a) => (
                              <li key={a.id}>
                                Version {a.version} is kept, adopted {formatDate(a.adoptedAt)} by {personById(a.adoptedBy).name}. Businesses
                                verified while it was in force are recorded against it.
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </Panel>
            {anyLive || d.entityTypes.some((k) => current(k)?.state === "WITHDRAWN") ? (
              <p className="m-0 text-[12.5px] text-faint">
                Stopping something never un-verifies a business. A business you&rsquo;ve already confirmed stays confirmed.
              </p>
            ) : null}
          </section>
        ) : null}

        {/* The members list SCR-DSG-03 promised NDI's service account would appear in. */}
        {d.state === "ACTIVE" || d.state === "SUSPENDED" ? (
          <section aria-labelledby="auth-members" className="flex flex-col gap-3">
            <h2 id="auth-members" className="m-0 font-display text-[16px] font-semibold text-strong">
              Members
            </h2>
            <Panel padded={false}>
              <ul className="relative z-[4] m-0 list-none p-0">
                {(org?.memberIds ?? []).map((pid, i) => (
                  <li key={pid} className={`flex items-center justify-between gap-3 px-5 py-3 ${i > 0 ? "border-t border-subtle" : ""}`}>
                    <span className="text-[13.5px] text-body">{personById(pid).name}</span>
                    <StatusPill status="active" label={roleIn(org, personById(pid)) ?? "Member"} />
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 border-t border-subtle px-5 py-3">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] text-body">NDI service account</span>
                    <span className="text-[12.5px] text-faint">Sends only the request you approved, in your name</span>
                  </span>
                  <StatusPill status={d.ndiAccess === "ACTIVE" ? "active" : "withdrawn"} label={d.ndiAccess === "ACTIVE" ? "Verifier" : "Removed"} />
                </li>
              </ul>
            </Panel>
          </section>
        ) : null}

        <Dialog
          open={confirmAccess === "remove"}
          onClose={() => setConfirmAccess(null)}
          tone="danger"
          title="Remove NDI's access?"
          lead="NDI's service account will no longer be able to send requests in your name — from this moment. What you've agreed stays agreed, and you can turn it back on."
          consequences={[
            "Businesses can't verify with you while it's removed",
            "Businesses already verified are not affected",
          ]}
          confirmLabel="Remove NDI's access"
          onConfirm={() => {
            const r = setNdiAccess(d.id, false);
            setConfirmAccess(null);
            if (r.ok) setNotice("NDI's service account can no longer send requests in your name. What you've agreed stays agreed.");
          }}
        />
        <Dialog
          open={confirmAccess === "restore"}
          onClose={() => setConfirmAccess(null)}
          title="Turn NDI's access back on?"
          lead="NDI's service account will again be able to send the request you approved, in your name."
          confirmLabel="Turn it back on"
          onConfirm={() => {
            const r = setNdiAccess(d.id, true);
            setConfirmAccess(null);
            if (r.ok) setNotice("NDI's service account can send the request you approved again.");
          }}
        />
      </div>
    </AppShell>
  );
}
