"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { ENFORCEMENT_DATE, OBSERVED_OPERATORS, accInProgress, type Accreditation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { accPill, capVerb, daysUntil } from "./shared";

/**
 * Accreditations — NDI's administrator console for Flow 4.
 *
 * FOUR LISTS, BECAUSE THERE ARE FOUR JOBS
 *
 * Every pending item has to be reachable from a list, never only from an
 * emailed link, and show the time it has left (UX-EW-02 §3.4, pending-item
 * list). An administrator arrives here to do one of four things, and each
 * is its own list: approve what a colleague proposed or recommended
 * (SCR-ACC-02), review what a business asked for (SCR-ACC-05), recognise an
 * organisation the gate has seen operating without approval (the entry to
 * SCR-ACC-01's recognition state), or look something up. One merged table
 * sorted by date was tried first; it put "waiting for a second approval"
 * and "approved two years ago" side by side and made the first easy to miss.
 *
 * Proposing from scratch — Kind N or E — is the page action, not a list.
 */
const OVERDUE_DAYS = 14;

export function AccreditationsAdminView() {
  const router = useRouter();
  const { accreditations, organizations, personById, hydrated } = useDemo();
  const forced = useScreenState("SCR-ACC-ADMIN", ["live", "loading", "empty", "offline"]);

  const empty = forced === "empty";
  const now = new Date().toISOString().slice(0, 10);
  const lapsed = (a: Accreditation) => a.state === "PROPOSED" && Boolean(a.expiresAt && a.expiresAt < now);
  const toApprove = empty ? [] : accreditations.filter((a) => a.state === "PROPOSED");
  const toReview = empty ? [] : accreditations.filter((a) => a.state === "SUBMITTED" || a.state === "IN_REVIEW");
  /* The recognition list: what the gate observed, less anyone already on
     their way to approval for it. Removing them as they are proposed is
     what makes the list shrink to nothing by the enforcement date. */
  const recognise = empty
    ? []
    : OBSERVED_OPERATORS.filter(
        (o) => !accreditations.some((a) => a.orgId === o.orgId && a.capability === o.capability && accInProgress(a)),
      );
  const rest = empty
    ? []
    : accreditations.filter((a) => !toApprove.includes(a) && !toReview.includes(a));
  const orgName = (id: string) => organizations.find((o) => o.id === id)?.name ?? "An organisation";

  if (!hydrated || forced === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const row = (a: Accreditation, href: string, meta: React.ReactNode, i: number) => {
    const pill = lapsed(a) ? { status: "lapsed", label: "Lapsed" } : accPill(a, "admin");
    return (
      <li key={a.id} className={i > 0 ? "border-t border-subtle" : ""}>
        <Link href={href} className="ndi-plainlink flex flex-col gap-2 px-5 py-4 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[14px] font-medium text-body">
              {a.orgName} · {a.capability === "verifier" ? "Verify" : "Issue"}
            </span>
            <span className="text-[12.5px] text-faint">{meta}</span>
          </span>
          <StatusPill status={pill.status} label={pill.label} />
        </Link>
      </li>
    );
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <PageHeader
          crumbs={[{ label: "NDI administration" }, { label: "Accreditations" }]}
          title="Accreditations"
          actions={
            <GradientButton onClick={() => router.push("/admin/accreditations/new")} disabled={forced === "offline"}>
              <Icon name="plus" size={15} strokeWidth={2.2} />
              Propose an accreditation
            </GradientButton>
          }
        />
        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          Which organisations are approved to verify or issue, and what each may ask for or issue.
          Every accreditation needs two administrators, and an approved organisation is added to
          NDI&rsquo;s public list of trusted organisations.
        </p>
        {forced === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is what was here when you were last connected; deciding is
            switched off.
          </p>
        ) : null}

        <section aria-labelledby="acc-approve" className="flex flex-col gap-3">
          <h2 id="acc-approve" className="m-0 font-display text-[16px] font-semibold text-strong">
            Waiting for approval
          </h2>
          <Panel padded={false}>
            {toApprove.length === 0 ? (
              <EmptyState icon="userCheck" title="Nothing is waiting for your approval." message="Proposals and reviewed requests come here for a second administrator." />
            ) : (
              <ul className="relative z-[4] m-0 list-none p-0">
                {toApprove.map((a, i) =>
                  row(
                    a,
                    `/admin/accreditations/${a.id}`,
                    lapsed(a)
                      ? "This proposal lapsed without a decision."
                      : `${a.recommendation ? "Reviewed" : "Proposed"} by ${a.proposedBy ? personById(a.proposedBy).name : "—"} · ${daysUntil(a.expiresAt)} days left`,
                    i,
                  ),
                )}
              </ul>
            )}
          </Panel>
        </section>

        <section aria-labelledby="acc-review" className="flex flex-col gap-3">
          <h2 id="acc-review" className="m-0 font-display text-[16px] font-semibold text-strong">
            Requests to review
          </h2>
          <Panel padded={false}>
            {toReview.length === 0 ? (
              <EmptyState icon="fileText" title="No requests are waiting for review." message="When a verified business asks to verify or issue, its request comes here first." />
            ) : (
              <ul className="relative z-[4] m-0 list-none p-0">
                {toReview.map((a, i) => {
                  const waited = a.requestedAt ? Math.floor((Date.now() - new Date(a.requestedAt).getTime()) / 86_400_000) : 0;
                  return row(
                    a,
                    `/admin/accreditations/${a.id}/review`,
                    <>
                      Asked by {a.requestedBy ? personById(a.requestedBy).name : "—"} · waiting since{" "}
                      {a.requestedAt ? formatDate(a.requestedAt) : "—"}
                      {waited > OVERDUE_DAYS ? " · overdue" : ""}
                    </>,
                    i,
                  );
                })}
              </ul>
            )}
          </Panel>
        </section>

        <section aria-labelledby="acc-recognise" className="flex flex-col gap-3">
          <h2 id="acc-recognise" className="m-0 font-display text-[16px] font-semibold text-strong">
            Operating without approval
          </h2>
          <p className="m-0 max-w-[70ch] text-[13px] leading-[1.6] text-muted">
            Organisations seen verifying or issuing before approvals were required. From{" "}
            {formatDate(ENFORCEMENT_DATE)}, anything they do without an approval will be refused.
          </p>
          <Panel padded={false}>
            {recognise.length === 0 ? (
              <EmptyState icon="shieldCheck" title="No unapproved organisations have been seen verifying or issuing." message="Anyone the gate sees doing either without an approval appears here, with what it was doing." />
            ) : (
              <ul className="relative z-[4] m-0 list-none p-0">
                {recognise.map((o, i) => (
                  <li
                    key={`${o.orgId}-${o.capability}`}
                    className={`flex flex-col gap-3 px-5 py-4 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between ${i > 0 ? "border-t border-subtle" : ""}`}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[14px] font-medium text-body">
                        {orgName(o.orgId)} · {o.capability === "verifier" ? "Verifying" : "Issuing"}
                      </span>
                      <span className="text-[12.5px] text-faint">
                        Seen since {formatDate(o.since)} ·{" "}
                        {o.capability === "verifier"
                          ? `asks for ${o.ask.length} item${o.ask.length === 1 ? "" : "s"}`
                          : o.issue.map((t) => t.name).join(", ")}
                      </span>
                    </span>
                    <HairlineButton
                      onClick={() => router.push(`/admin/accreditations/new?recognise=${o.orgId}:${o.capability}`)}
                      disabled={forced === "offline"}
                    >
                      Propose to {capVerb(o.capability)}
                    </HairlineButton>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>

        {rest.length ? (
          <section aria-labelledby="acc-all" className="flex flex-col gap-3">
            <h2 id="acc-all" className="m-0 font-display text-[16px] font-semibold text-strong">
              All accreditations
            </h2>
            <Panel padded={false}>
              <ul className="relative z-[4] m-0 list-none p-0">
                {rest.map((a, i) =>
                  row(
                    a,
                    `/admin/accreditations/${a.id}`,
                    a.listedAt
                      ? `Listed since ${formatDate(a.listedAt)}`
                      : a.state === "PENDING_ACCEPTANCE"
                        ? `${daysUntil(a.expiresAt)} days left to accept`
                        : a.decidedAt
                          ? `Decided ${formatDate(a.decidedAt)}`
                          : "—",
                    i,
                  ),
                )}
              </ul>
            </Panel>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
