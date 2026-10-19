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
import { StatusPill } from "@/components/ui/StatusPill";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { attrLabel, issuerInline, requestWords, useHolder, useSimulatedDelivery } from "./shared";

/**
 * SCR-CRD-04 — Review a credential. FLOW-CRD-01 step 11, FLOW-CRD-02
 * step 4: check what arrived before it becomes the organisation's.
 *
 * THE CHECK IS THE POINT
 *
 * Accepting is how a wrong taxpayer number becomes the business's own, to
 * be shown to a bank. So every attribute is listed as offered and labelled,
 * the prompt says to check them, and says what to do if one is wrong —
 * decline and contact the issuer (UN-40). Acceptance isn't a formality to be
 * clicked through; it's the second of the two decisions SCR-CRD-02 named.
 *
 * WHERE IT CAME FROM
 *
 * The issuer's name as NDI lists it, marked as on NDI's list; whether this
 * answers a request (and whose) or arrived unasked; whether it replaces
 * something already held. Those are the three things that tell a person
 * whether to expect it.
 *
 * Before the offer arrives this is the request's own page — the same
 * sentence as the list, and the dates — so there is one address for a
 * request from asking to accepting.
 */
type Face = "live" | "default" | "loading" | "done" | "declined" | "e13" | "e14" | "offline" | "no_permission";

export function ReviewCredentialView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { credentialRequests, offerings, heldCredentials, personById, acceptCredentialOffer, declineCredentialOffer, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-04", ["live", "default", "loading", "done", "declined", "e13", "e14", "offline", "no_permission"]) as Face;

  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [failed, setFailed] = useState<"E13" | "offline" | null>(null);

  const r = credentialRequests.find((x) => x.id === requestId);
  useSimulatedDelivery(r ? [r] : []);
  const offering = offerings.find((o) => o.id === r?.offeringId);
  const replaces = heldCredentials.find((c) => c.id === r?.replaces);

  const natural: Face = busy
    ? "loading"
    : r?.state === "ISSUED"
      ? "done"
      : r?.state === "DECLINED_BY_HOLDER"
        ? "declined"
        : failed === "E13" || r?.state === "EXPIRED"
          ? "e13"
          : failed === "offline"
            ? "offline"
            : !holder.can("credential:accept")
              ? "no_permission"
              : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (!r) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "Wallet" }, { label: "Requests and offers", href: "/wallet/requests" }]} title="Not found" />
          <Panel>
            <p className="relative z-[4] m-0 text-[14px] text-body">There&rsquo;s no request here. It may belong to another organisation.</p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const issuer = r.issuerName;
  const words = requestWords(r, offering?.answerWindowDays ?? 5);
  /* A forced face shows the review itself, with the offering's example
     values if nothing has been offered yet — a reviewer can reach every
     state without first walking a request to the issuer and back. */
  const offered = r.state === "OFFER_READY" || forced !== "live";
  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Requests and offers", href: "/wallet/requests" }, { label: r.credential }]}
      title={offered || face === "done" ? `Review your ${r.credential}` : r.credential}
    />
  );

  /* Before the offer: the request's own page. */
  if (!offered && face !== "done" && face !== "declined" && face !== "e13" && face !== "e14") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={words.status} label={words.label} />
                <p role="status" className="m-0 text-[14px] text-body">
                  {words.sentence}
                </p>
              </div>
              <dl className="m-0 grid gap-x-6 gap-y-3 min-[641px]:grid-cols-2">
                <Fact term="Asked by" value={`${personById(r.requestedBy).name} on ${formatDate(r.requestedAt)}`} />
                <Fact term="Shared" value={`Your ${r.consented.credential}, all of it`} />
                {r.answerBy ? <Fact term={`${issuer} answers by`} value={formatDate(r.answerBy)} /> : null}
                {r.consentBy ? <Fact term="Your answer needed by" value={formatDate(r.consentBy)} /> : null}
              </dl>
              <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
                {r.state === "NEEDS_CONSENT" ? (
                  <GradientButton onClick={() => router.push(`/wallet/requests/${r.id}/more`)}>Answer</GradientButton>
                ) : null}
                {["WITHDRAWN", "EXPIRED", "DECLINED_BY_ISSUER", "FAILED"].includes(r.state) ? (
                  <GradientButton onClick={() => router.push(`/wallet/get/${r.offeringId}`)}>Ask again</GradientButton>
                ) : null}
                <HairlineButton onClick={() => router.push("/wallet/requests")}>Back to requests</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "done" || face === "declined" || face === "e13" || face === "e14") {
    const message =
      face === "done"
        ? "Added to your credentials."
        : face === "declined"
          ? "You've declined this. Nothing has been added."
          : face === "e13"
            ? `This offer from ${issuerInline(issuer)} expired. You can ask again.`
            : `Something went wrong receiving this from ${issuerInline(issuer)}. Nothing has been added. Try asking again.`;
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role={face === "done" || face === "declined" ? "status" : "alert"} className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                {face === "done" ? (
                  <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                ) : null}
                {message}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {face === "done" ? (
                  <GradientButton onClick={() => router.push("/wallet/credentials")}>Go to your credentials</GradientButton>
                ) : face === "declined" ? (
                  <HairlineButton onClick={() => router.push("/wallet/requests")}>Back to requests</HairlineButton>
                ) : (
                  <GradientButton onClick={() => router.push(`/wallet/get/${r.offeringId}`)}>Ask again</GradientButton>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const accept = () => {
    if (forced === "offline") {
      setFailed("offline");
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      const res = acceptCredentialOffer(r.id);
      setBusy(false);
      if (!res.ok && res.error === "E13") setFailed("E13");
    }, ROUND_TRIP_MS);
  };

  const attributes = r.offer?.attributes ?? offering?.fields.map((f) => ({ name: f.name, value: f.example })) ?? [];
  const readOnly = face === "no_permission";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            That didn&rsquo;t go through, so nothing was added. Try again when you&rsquo;re back online.
          </p>
        ) : null}
        {readOnly ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            You can see what was sent. {holder.rootName} can accept or decline it.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="m-0 text-[14px] text-body">
                From <span className="font-medium text-strong">{issuer}</span>
              </p>
              <p className="m-0 flex items-center gap-1.5 text-[12.5px] text-muted">
                <Icon name="shieldCheck" size={13} strokeWidth={2} style={{ color: "var(--ndi-success)" }} />
                On NDI&rsquo;s list of trusted organisations
              </p>
              <p className="m-0 text-[12.5px] text-faint">
                In answer to the request {personById(r.requestedBy).name} made on {formatDate(r.requestedAt)}
              </p>
            </div>

            <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
              Check these details are right. If something is wrong, decline and contact {issuerInline(issuer)}.
            </p>

            <dl className="m-0 grid gap-x-6 gap-y-3 rounded-[12px] border border-grid px-4 py-3 min-[641px]:grid-cols-2">
              {attributes.map((a) => (
                <Fact key={a.name} term={offering?.fields.find((f) => f.name === a.name)?.label ?? attrLabel(a.name)} value={a.value} />
              ))}
              <Fact term="Valid" value={r.offer?.validUntil ? `Until ${formatDate(r.offer.validUntil)}` : "Until it's revoked"} />
            </dl>

            {replaces ? (
              <p className="m-0 text-[13px] leading-[1.6] text-body">
                This replaces the {replaces.type} you received on {formatDate(replaces.receivedAt)}. You&rsquo;ll keep both;
                only the newer one is shared.
              </p>
            ) : null}
            {r.offer ? <p className="m-0 text-[12.5px] text-faint">This offer is open until {formatDate(r.offer.expiresAt)}.</p> : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={accept} disabled={readOnly || face === "loading"}>
                {face === "loading" ? "Adding to your credentials…" : "Accept"}
              </GradientButton>
              <HairlineButton onClick={() => setDeclining(true)} disabled={readOnly || face === "loading"}>
                Decline
              </HairlineButton>
            </div>
          </div>
        </Panel>

        <Dialog
          open={declining}
          onClose={() => setDeclining(false)}
          title={`Decline this ${r.credential}?`}
          lead={`Nothing is added to your credentials. If something in it is wrong, contact ${issuerInline(issuer)} — you can ask again afterwards.`}
          confirmLabel="Decline"
          onConfirm={() => {
            declineCredentialOffer(r.id);
            setDeclining(false);
          }}
        />
      </div>
    </AppShell>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={LABEL_CLASS}>{term}</dt>
      <dd className="m-0 text-[13.5px] text-body">{value}</dd>
    </div>
  );
}
