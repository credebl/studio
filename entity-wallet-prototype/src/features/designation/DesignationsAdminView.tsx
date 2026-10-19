"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { isNamedAdmin, type Designation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { daysLeft, dsgPill, kindsInWords } from "./shared";

/**
 * Designations — NDI's administrator console for Flow 5.
 *
 * LISTS BY WHO IS BEING WAITED ON
 *
 * A designation is rare, slow and passes between people at two
 * organisations, so every pending one has to be reachable from a list with
 * its time left — never only from an emailed link (UX-EW-02 §3.4,
 * pending-item list; SC 2.2.1). The lists are split by who has to act next
 * — a second administrator, the authority, or NDI's own checks — because
 * "pending" alone doesn't tell an administrator whether the next move is
 * theirs (UN-25).
 *
 * The root account never sees this page in the menu: it approves nothing
 * (FLOW-ONB-02 v0.6). UX-EW-02 still names Root as a possible second
 * approver; FLOW-ONB-02 v0.6 is later and takes that away, and the
 * prototype follows the later document.
 */
export function DesignationsAdminView() {
  const router = useRouter();
  const { designations, currentPerson, personById, hydrated } = useDemo();
  const forced = useScreenState("SCR-DSG-ADMIN", ["live", "loading", "empty", "offline"]);

  const empty = forced === "empty";
  const offline = forced === "offline";
  const list = (pred: (d: Designation) => boolean) => (empty ? [] : designations.filter(pred));
  const toApprove = list((d) => d.state === "PROPOSED");
  const withOrg = list((d) => d.state === "PENDING");
  const checks = list((d) => d.state === "ACCEPTED");
  const live = list((d) => d.state === "ACTIVE" || d.state === "SUSPENDED");
  const ended = list((d) => ["REFUSED", "DECLINED", "EXPIRED"].includes(d.state));
  const isRoot = currentPerson.platformRole === "root";

  if (!hydrated || forced === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const row = (d: Designation, href: string, meta: React.ReactNode, i: number) => {
    const pill = dsgPill(d, "admin");
    return (
      <li key={d.id} className={i > 0 ? "border-t border-subtle" : ""}>
        <Link href={href} className="ndi-plainlink flex flex-col gap-2 px-5 py-4 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[14px] font-medium text-body">
              {d.orgName} · {kindsInWords(d.entityTypes)}
            </span>
            <span className="text-[12.5px] text-faint">{meta}</span>
          </span>
          <StatusPill status={pill.status} label={pill.label} />
        </Link>
      </li>
    );
  };

  const section = (id: string, title: string, items: Designation[], emptyText: string, render: (d: Designation, i: number) => React.ReactNode) => (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="m-0 font-display text-[16px] font-semibold text-strong">
        {title}
      </h2>
      <Panel padded={false}>
        {items.length === 0 ? (
          <p className="relative z-[4] m-0 px-5 py-4 text-[13px] text-muted">{emptyText}</p>
        ) : (
          <ul className="relative z-[4] m-0 list-none p-0">{items.map(render)}</ul>
        )}
      </Panel>
    </section>
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
        <PageHeader
          crumbs={[{ label: "NDI administration" }, { label: "Designations" }]}
          title="Designations"
          actions={
            isNamedAdmin(currentPerson) ? (
              <GradientButton onClick={() => router.push("/admin/designations/new")} disabled={offline}>
                <Icon name="plus" size={15} strokeWidth={2.2} />
                Propose a designation
              </GradientButton>
            ) : undefined
          }
        />
        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          Which authority confirms which kind of business. A designation makes an organisation the
          root of trust for those businesses, so it takes two administrators, the organisation&rsquo;s
          own acceptance, and checks before it switches on — and even then nothing is live until the
          authority agrees what people will be asked.
        </p>
        {isRoot ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            The root account doesn&rsquo;t propose or approve designations. NDI&rsquo;s platform
            administrators do, and each needs a second one to approve it.
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is what was here when you were last connected; deciding is
            switched off.
          </p>
        ) : null}

        <section aria-labelledby="dsg-approve" className="flex flex-col gap-3">
          <h2 id="dsg-approve" className="m-0 font-display text-[16px] font-semibold text-strong">
            Waiting for approval
          </h2>
          <Panel padded={false}>
            {toApprove.length === 0 ? (
              <EmptyState icon="userCheck" title="Nothing is waiting for your approval." message="Designations a colleague proposes come here for a second administrator." />
            ) : (
              <ul className="relative z-[4] m-0 list-none p-0">
                {toApprove.map((d, i) =>
                  row(d, `/admin/designations/${d.id}`, `Proposed by ${d.proposedBy ? personById(d.proposedBy).name : "—"}${d.proposedAt ? `, ${formatDate(d.proposedAt)}` : ""}`, i),
                )}
              </ul>
            )}
          </Panel>
        </section>

        {section("dsg-org", "Waiting for the organisation", withOrg, "Nothing is waiting for an organisation to accept.", (d, i) =>
          row(d, `/admin/designations/${d.id}`, `Approved by ${d.approvedBy ? personById(d.approvedBy).name : "—"} · ${daysLeft(d.expiresAt)} days left to accept`, i),
        )}

        {section("dsg-checks", "Accepted — checks not passing yet", checks, "Nothing is waiting on the activation checks.", (d, i) =>
          row(
            d,
            `/admin/designations/${d.id}/activation`,
            `${(d.checks ?? []).filter((c) => !c.pass).length} check${(d.checks ?? []).filter((c) => !c.pass).length === 1 ? "" : "s"} to resolve · last run ${d.checkedAt ? formatDate(d.checkedAt) : "—"}`,
            i,
          ),
        )}

        {section("dsg-live", "Designated", live, "No organisation is designated yet.", (d, i) =>
          row(
            d,
            `/admin/designations/${d.id}`,
            d.ndiAccess === "REMOVED"
              ? `${d.orgName} has withdrawn the platform's permission to request proofs in its name.`
              : `Since ${d.activatedAt ? formatDate(d.activatedAt) : "—"}`,
            i,
          ),
        )}

        {ended.length ? (
          section("dsg-ended", "Ended", ended, "", (d, i) =>
            row(
              d,
              `/admin/designations/${d.id}`,
              d.state === "EXPIRED"
                ? "This designation expired unaccepted."
                : d.state === "DECLINED"
                  ? `${d.orgName} declined it.`
                  : `Refused: ${d.refusedReason ?? "—"}`,
              i,
            ),
          )
        ) : null}
      </div>
    </AppShell>
  );
}
