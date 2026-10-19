"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, type CredentialRequest } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { requestWords, useHolder, useSimulatedDelivery } from "./shared";

/**
 * SCR-CRD-03 — Requests and offers. FLOW-CRD-01 steps 3–10, FLOW-CRD-02
 * step 3: one page, two regions, as UXD-16 did for the authority console.
 *
 * WHO HAS IT NOW
 *
 * A request can sit with an issuer for days. The column that matters isn't
 * a status code but a sentence saying who has it and what happens next —
 * "Waiting for the Department of Revenue & Customs — usually within 5
 * days" — and the date it next changes. That sentence is what stops a
 * proprietor deciding on day three that NDI is broken (UN-38, UC-29).
 *
 * WAITING FOR YOU, ABOVE EVERYTHING ELSE
 *
 * What needs a person here — an offer to review, a wider ask to answer —
 * comes first, with when it lapses. It also takes offers that arrived
 * without a request (FLOW-CRD-02), which until this flow had a page of
 * their own; they're the same thing to the person: something waiting to be
 * accepted or declined.
 *
 * Withdrawing is offered until the issuer has replied (A2), and says what
 * it does before it does it.
 */
type Face = "live" | "default" | "empty" | "loading" | "error" | "offline" | "no_permission";

export function RequestsView() {
  const router = useRouter();
  const { credentialRequests, offers, offerings, personById, withdrawCredentialRequest, simulateAskForMore, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-03", ["live", "default", "empty", "loading", "error", "offline", "no_permission"]) as Face;
  const [withdrawing, setWithdrawing] = useState<CredentialRequest | null>(null);

  const requests = credentialRequests.filter(inOrg(holder.orgId));
  useSimulatedDelivery(requests);
  const legacy = offers.filter(inOrg(holder.orgId)).filter((o) => o.state === "pending" || o.state === "parked");
  const waiting = requests.filter((r) => r.state === "OFFER_READY" || r.state === "NEEDS_CONSENT");

  const canAct = holder.can("credential:receive") || holder.can("credential:accept");
  const natural: Face = !requests.length && !legacy.length ? "empty" : !canAct ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const readOnly = face === "no_permission" || face === "offline";
  const windowFor = (r: CredentialRequest) => offerings.find((o) => o.id === r.offeringId)?.answerWindowDays ?? 5;

  const header = <PageHeader crumbs={[{ label: "Wallet" }, { label: "Requests and offers" }]} title="Requests and offers" />;

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

  if (face === "empty") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState
              icon="download"
              title="Nothing in progress."
              message="When you ask an office for a credential, or one is sent to you, it shows here."
              action={<GradientButton onClick={() => router.push("/wallet/get")}>Get a credential</GradientButton>}
            />
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
            We couldn&rsquo;t load this. Nothing has changed.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </div>
        </div>
      </AppShell>
    );
  }

  /* The prototype's one way to reach A1 — an issuer whose proof request
     asks for more than the consent covered. Offered on the first request
     still with the issuer, and drawn as a stand-in. */
  const askable = requests.find((r) => r.state === "WITH_ISSUER" && !r.askedMore);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is how things stood when it was last loaded.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You can see where things stand. {holder.rootName} can answer or accept them.
          </p>
        ) : null}

        <section aria-labelledby="crd-waiting" className="flex flex-col gap-3">
          <h2 id="crd-waiting" className="m-0 font-display text-[15px] font-semibold text-strong">
            Waiting for you
          </h2>
          {waiting.length || legacy.length ? (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {waiting.map((r) => {
                const words = requestWords(r, windowFor(r));
                const lapses = r.state === "OFFER_READY" ? r.offer?.expiresAt : r.consentBy;
                return (
                  <li key={r.id}>
                    <Panel>
                      <div className="relative z-[4] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="m-0 text-[14px] font-medium text-strong">{r.credential}</p>
                          <p className="m-0 text-[13px] text-body">{words.sentence}</p>
                          {lapses ? <p className="m-0 text-[12.5px] text-faint">Until {formatDate(lapses)}</p> : null}
                        </div>
                        <GradientButton
                          onClick={() => router.push(r.state === "OFFER_READY" ? `/wallet/requests/${r.id}` : `/wallet/requests/${r.id}/more`)}
                        >
                          {r.state === "OFFER_READY" ? "Review" : "Answer"}
                        </GradientButton>
                      </div>
                    </Panel>
                  </li>
                );
              })}
              {legacy.map((o) => (
                <li key={o.id}>
                  <Panel>
                    <div className="relative z-[4] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="m-0 text-[14px] font-medium text-strong">{o.type}</p>
                        <p className="m-0 text-[13px] text-body">{o.issuer} has sent you this — review it</p>
                        <p className="m-0 text-[12.5px] text-faint">Until {formatDate(o.expiresAt)}</p>
                      </div>
                      <HairlineButton onClick={() => router.push(`/wallet/offers/${o.id}`)}>Review</HairlineButton>
                    </div>
                  </Panel>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-[13px] text-muted">Nothing needs an answer from you.</p>
          )}
        </section>

        <section aria-labelledby="crd-requests" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="crd-requests" className="m-0 font-display text-[15px] font-semibold text-strong">
              Requests
            </h2>
            <Link href="/wallet/get" className="ndi-plainlink text-[13px] font-medium text-muted">
              Get a credential
            </Link>
          </div>
          <Panel padded={false}>
            <DataTable
              columns={["Credential", "Where it stands", "Asked by", "Next date", ""]}
              empty={{ icon: "download", title: "No requests", message: "Requests you make to offices show here.", compact: true }}
            >
              {requests.length
                ? requests.map((r) => {
                    const words = requestWords(r, windowFor(r));
                    const next = r.state === "WITH_ISSUER" ? r.answerBy : r.state === "NEEDS_CONSENT" ? r.consentBy : r.state === "OFFER_READY" ? r.offer?.expiresAt : null;
                    const canWithdraw = ["AWAITING_PROOF", "NEEDS_CONSENT", "WITH_ISSUER"].includes(r.state);
                    return (
                      <tr key={r.id}>
                        <td className="text-body">
                          {r.credential}
                          <span className="block text-[12px] text-faint">{r.issuerName}</span>
                        </td>
                        <td>
                          <span className="flex flex-col items-start gap-1">
                            <StatusPill status={words.status} label={words.label} />
                            <span className="max-w-[44ch] text-[12.5px] leading-[1.5] text-muted">{words.sentence}</span>
                          </span>
                        </td>
                        <td>
                          {personById(r.requestedBy).name}
                          <span className="block text-[12px] text-faint">{formatDate(r.requestedAt)}</span>
                        </td>
                        <td>{next ? formatDate(next) : "—"}</td>
                        <td>
                          <span className="flex flex-wrap gap-3">
                            <Link href={`/wallet/requests/${r.id}`} className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted">
                              Open
                            </Link>
                            {canWithdraw ? (
                              <button
                                type="button"
                                disabled={readOnly || !holder.can("credential:receive")}
                                onClick={() => setWithdrawing(r)}
                                className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted disabled:opacity-55"
                              >
                                Withdraw
                              </button>
                            ) : null}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </DataTable>
          </Panel>
        </section>

        {askable && !readOnly ? (
          <SimulatedStep
            standsFor={`${askable.issuerName}'s system asking for more than the request said`}
            action={<SimulatedAction onClick={() => simulateAskForMore(askable.id)}>Have it ask for a bank account too</SimulatedAction>}
          >
            An issuer&rsquo;s proof request can ask for more than the business agreed to share. When it does, nothing more
            is sent until someone here answers.
          </SimulatedStep>
        ) : null}

        <Dialog
          open={Boolean(withdrawing)}
          onClose={() => setWithdrawing(null)}
          title="Withdraw this request?"
          lead={withdrawing ? `${withdrawing.issuerName} stops considering it. What you've already shared can't be unshared, and nothing will be issued.` : ""}
          consequences={["Nothing will be issued on this request", "You can ask again later"]}
          confirmLabel="Withdraw"
          tone="danger"
          onConfirm={() => {
            if (withdrawing) withdrawCredentialRequest(withdrawing.id);
            setWithdrawing(null);
          }}
        />
      </div>
    </AppShell>
  );
}
