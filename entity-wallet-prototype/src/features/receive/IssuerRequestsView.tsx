"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, type CredentialRequest } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { useIssuer } from "./issuerShared";
import { daysLeft, valueFor } from "./shared";

/**
 * SCR-CRD-08 — Requests to answer. FLOW-CRD-03 step 4, E6, A2: the
 * officer's working queue.
 *
 * LEAST TIME LEFT FIRST
 *
 * The queue is sorted by when each request lapses, because that's the
 * order an officer has to work it in, and "Open next" opens the top one.
 * Each row leads with the key verified identifier — the registration
 * number, from the credential the business shared — which is what the
 * officer will look up in the office's own register. The business's name
 * is shown too, labelled as NDI's, because it is: it isn't evidence, and
 * the queue shouldn't start teaching otherwise before SCR-CRD-09 does.
 *
 * WHY IT'S HERE
 *
 * A queue offering, something the office's system referred, or something
 * the system hasn't picked up (E6). The last two only matter once the
 * office connects its system (SCR-CRD-10); today every request is the
 * first kind, and the state switcher shows the others.
 */
type Face = "live" | "default" | "empty" | "loading" | "error" | "offline" | "e6";

export function IssuerRequestsView() {
  const router = useRouter();
  const { credentialRequests, organizations, heldCredentials, personById, hydrated } = useDemo();
  const issuer = useIssuer();
  const forced = useScreenState("SCR-CRD-08", ["live", "default", "empty", "loading", "error", "offline", "e6"]) as Face;

  const mine = credentialRequests.filter((r) => r.issuerOrgId === issuer.org?.id);
  const waiting = mine.filter((r) => r.state === "WITH_ISSUER").sort((a, b) => ((a.answerBy ?? "") < (b.answerBy ?? "") ? -1 : 1));
  const answered = mine.filter((r) => r.state !== "WITH_ISSUER" && r.state !== "AWAITING_PROOF" && r.state !== "NEEDS_CONSENT");

  const natural: Face = !waiting.length && !answered.length ? "empty" : "default";
  const face: Face = forced === "live" ? natural : forced;

  const header = (
    <PageHeader
      crumbs={[{ label: issuer.name }, { label: "Requests to answer" }]}
      title="Requests to answer"
      actions={
        waiting.length && face !== "offline" ? (
          <GradientButton onClick={() => router.push(`/issuer/requests/${waiting[0].id}`)}>Open next</GradientButton>
        ) : null
      }
    />
  );

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div aria-hidden="true" className="h-64 animate-pulse rounded-[16px] border border-grid" />
        </div>
      </AppShell>
    );
  }

  if (!issuer.isOfficer) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel>
            <p className="relative z-[4] m-0 text-[14px] text-body">Only an issuing office&rsquo;s officers answer requests.</p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="download" title="No requests are waiting." message="When a business asks you for a credential, it shows here." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "error") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We couldn&rsquo;t load requests.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const identifier = (r: CredentialRequest) => {
    const held = heldCredentials.filter(inOrg(r.orgId)).find((c) => c.type === r.consented.credential);
    return held ? valueFor(held.attributes, r.consented.uses.find((u) => /number/i.test(u)) ?? r.consented.uses[0]) : null;
  };
  const business = (r: CredentialRequest) => organizations.find((o) => o.id === r.orgId)?.name ?? "A business";
  const outcome = (r: CredentialRequest) =>
    r.state === "OFFER_READY"
      ? { status: "offered", label: "Issued — waiting for the business" }
      : r.state === "ISSUED"
        ? { status: "issued", label: "Issued" }
        : r.state === "DECLINED_BY_ISSUER"
          ? { status: "declined", label: "Declined by you" }
          : r.state === "DECLINED_BY_HOLDER"
            ? { status: "declined", label: "Declined by the business" }
            : r.state === "WITHDRAWN"
              ? { status: "withdrawn", label: "Withdrawn" }
              : r.state === "EXPIRED"
                ? { status: "lapsed", label: "Expired" }
                : { status: "failed", label: "Failed" };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is the queue as it was last loaded; answering needs a connection.
          </p>
        ) : null}

        <section aria-labelledby="q-waiting" className="flex flex-col gap-3">
          <h2 id="q-waiting" className="m-0 font-display text-[15px] font-semibold text-strong">
            Waiting
          </h2>
          <Panel padded={false}>
            <DataTable
              columns={["Credential", "Verified identifier", "Business (from NDI)", "Received", "Time left", "Why it's here", ""]}
              empty={{ icon: "download", title: "No requests are waiting.", message: "", compact: true }}
            >
              {waiting.length
                ? waiting.map((r) => (
                    <tr key={r.id}>
                      <td className="text-body">{r.credential}</td>
                      <td className="font-mono text-[12.5px] text-body">{identifier(r) ?? "—"}</td>
                      <td>{business(r)}</td>
                      <td>{formatDate(r.requestedAt)}</td>
                      <td>{daysLeft(r.answerBy)} days</td>
                      <td className="max-w-[28ch] text-[12.5px] text-muted">
                        {face === "e6" ? "Your system hasn't picked this up. You can answer it here." : "Queue offering"}
                      </td>
                      <td>
                        {face === "offline" ? (
                          <span className="text-[12.5px] text-faint">Open</span>
                        ) : (
                          <Link href={`/issuer/requests/${r.id}`} className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted">
                            Open
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                : null}
            </DataTable>
          </Panel>
        </section>

        <section aria-labelledby="q-answered" className="flex flex-col gap-3">
          <h2 id="q-answered" className="m-0 font-display text-[15px] font-semibold text-strong">
            Answered
          </h2>
          <Panel padded={false}>
            <DataTable columns={["Credential", "Business (from NDI)", "Outcome", "Answered by"]} empty={{ icon: "fileText", title: "Nothing answered yet.", message: "", compact: true }}>
              {answered.length
                ? answered.map((r) => {
                    const o = outcome(r);
                    return (
                      <tr key={r.id}>
                        <td className="text-body">{r.credential}</td>
                        <td>{business(r)}</td>
                        <td>
                          <StatusPill status={o.status} label={o.label} />
                          {r.state === "WITHDRAWN" ? <span className="block text-[12px] text-faint">{business(r)} withdrew this request.</span> : null}
                        </td>
                        <td>{r.answeredBy ? `${personById(r.answeredBy).name}, ${formatDate(r.answeredAt ?? r.requestedAt)}` : "—"}</td>
                      </tr>
                    );
                  })
                : null}
            </DataTable>
          </Panel>
        </section>
      </div>
    </AppShell>
  );
}
