"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { DetailLayout } from "@/components/ui/DetailLayout";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

import { formatDate } from "@/features/controllership/scopeModel";

/**
 * B4 — review one offer and decide.
 *
 * THE ATTRIBUTES ARE THE PAYLOAD, NOT A SUMMARY.
 *
 * Every attribute the issuer actually offered is listed, in full, before any
 * button. The brief is specific that credential type is read from the real
 * agent-fetched payload rather than from anything a user typed, and the
 * screen has to make that visible: a Controller accepting a credential into
 * the entity's wallet is accepting these values, and a screen that showed
 * "Business Licence — 4 attributes" would be asking them to accept
 * something they have not seen.
 *
 * THE REFUSAL IS DESIGNED, NOT AN ERROR
 *
 * An out-of-scope offer is a normal event, not a fault. It gets the specific
 * rule that refused it, and one next step — a request to the owner — never a
 * self-edit. That last part matters more than it looks: an out-of-scope
 * refusal is exactly the moment a Controller would reach for a way to widen
 * their own authority, and there must not be one.
 */
export function OfferDetailView({ offerId }: { offerId: string }) {
  const router = useRouter();
  const { offers, acceptOffer, declineOffer, parkOffer, parkedOperations } = useDemo();

  const screenState = useScreenState("B4", [
    "reviewable",
    "out_of_scope",
    "requires_approval",
    "accepted",
    "declined",
  ]);

  const [asked, setAsked] = useState(false);

  const offer = offers.find((o) => o.id === offerId);

  if (!offer) {
    return (
      <AppShell>
        <DetailLayout
          width={720}
          header={
            <PageHeader
              crumbs={[{ label: "Offers", href: "/wallet/offers" }, { label: "Not found" }]}
              title="Offer not found"
            />
          }
        >
          <Panel>
            <p className="relative z-[4] text-[13.5px] text-muted">
              It may have been reset with the demo.{" "}
              <Link href="/wallet/offers" className="ndi-plainlink text-accent">
                Back to offers
              </Link>
              .
            </p>
          </Panel>
        </DetailLayout>
      </AppShell>
    );
  }

  /* The switcher overrides both the decision and the state, so each face is
     reachable on any offer rather than only on the fixture that carries it. */
  const decision =
    screenState === "out_of_scope"
      ? "out_of_scope"
      : screenState === "requires_approval"
        ? "requires_approval"
        : screenState === "reviewable"
          ? offer.decision
          : offer.decision;
  const state =
    screenState === "accepted"
      ? "accepted"
      : screenState === "declined"
        ? "declined"
        : offer.state;

  const parked = parkedOperations.find(
    (p) => p.targetId === offer.id && p.state === "parked",
  );

  const refused = decision === "out_of_scope";
  const needsApproval = decision === "requires_approval";
  const settled = state === "accepted" || state === "declined" || state === "expired";

  /* Context rather than the task: who sent this and whether they are
     accredited is what you check the offer against, so on a wide screen it
     sits beside the payload instead of pushing it down the page. */
  const issuer = (
    <Panel>
      <div className="relative z-[4] flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Offered by
          </p>
          <p className="font-display text-[14.5px] font-semibold text-strong">
            {offer.issuer}
          </p>
          <p className="break-all font-mono text-[11.5px] text-faint">{offer.issuerDid}</p>
        </div>
        <StatusPill
          status={offer.issuerTrusted ? "verified" : "pending"}
          label={offer.issuerTrusted ? "On the trust registry" : "Not on the trust registry"}
        />
      </div>
      {!offer.issuerTrusted ? (
        <p className="relative z-[4] mt-3 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
          This issuer is not accredited on the NDI trust registry. Anything
          they issue can still be held, but a relying party may not accept
          it.
        </p>
      ) : null}
    </Panel>
  );

  return (
    <AppShell>
      <DetailLayout
        header={
          <PageHeader
            crumbs={[{ label: "Offers", href: "/wallet/offers" }, { label: offer.type }]}
            title={offer.type}
            actions={<StatusPill status={state} />}
          />
        }
        side={
          <div className="flex flex-col gap-4">
            <CredentialCard type={offer.type} issuer={offer.issuer} status="offered" />
            {issuer}
          </div>
        }
      >
        {/* ---- The server's answer, first ---- */}
        {refused ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon
                name="lockRounded"
                size={18}
                strokeWidth={1.9}
                className="mt-0.5 flex-none"
                style={{ color: "var(--ndi-warning)" }}
              />
              <div className="flex flex-col gap-2">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  You cannot accept this one
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  {offer.decisionReason ??
                    "Accepting this kind of credential was not granted to you."}
                </p>
                {asked ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className="mt-1 flex items-start gap-2 text-[13px] leading-[1.5] text-accent"
                  >
                    <Icon name="check" size={14} strokeWidth={2.2} className="mt-px flex-none" />
                    <span>
                      Your request has gone to Dorji Wangchuk. The offer stays here
                      until it expires.
                    </span>
                  </p>
                ) : (
                  <div className="mt-1 flex flex-wrap gap-2.5">
                    <HairlineButton onClick={() => setAsked(true)}>
                      <Icon name="send" size={14} strokeWidth={2} />
                      Ask the owner to widen my authority
                    </HairlineButton>
                  </div>
                )}
              </div>
            </div>
          </Panel>
        ) : null}

        {state === "parked" || parked ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="userCheck" size={18} strokeWidth={1.9} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  Waiting for an approver
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  You have sent this to the approval queue. Nothing is accepted
                  until somebody authorised decides it, and it will lapse if
                  nobody does.
                </p>
                <div className="mt-1">
                  <Countdown expiresAt={offer.expiresAt} />
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {state === "accepted" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 flex-none text-accent" />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  In the entity&rsquo;s wallet
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  Recorded as Pelden Trading accepting it, carried out by
                  you.
                </p>
                <div className="mt-2">
                  <Link href="/wallet/credentials">
                    <HairlineButton>
                      See what we hold
                      <Icon name="arrowRight" size={14} strokeWidth={2} />
                    </HairlineButton>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* ---- What is actually in it ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              What it contains
            </h2>
            <p className="text-[12.5px] leading-[1.5] text-faint">
              Every attribute in the offer, as it arrived. Read from the offer
              itself, not from anything typed here.
            </p>
          </div>

          <ul className="relative z-[4] mt-3 flex flex-col">
            {offer.attributes.map((attribute, i) => (
              <li
                key={attribute.name}
                className={`grid gap-0.5 py-2.5 min-[521px]:grid-cols-[200px_1fr] min-[521px]:gap-6 ${
                  i > 0 ? "border-t border-subtle" : ""
                }`}
              >
                <span className="text-[12.5px] leading-[1.5] text-faint">
                  {attribute.name.replace(/_/g, " ")}
                </span>
                <span className="text-[13.5px] leading-[1.5] text-body">{attribute.value}</span>
              </li>
            ))}
          </ul>

          <div className="relative z-[4] mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-3">
            <span className="text-[12.5px] text-faint">
              Offered {formatDate(offer.receivedAt)}
            </span>
            {offer.state !== "expired" ? <Countdown expiresAt={offer.expiresAt} /> : null}
          </div>
        </Panel>

        {/* ---- The decision ---- */}
        {!refused && !settled && state !== "parked" && !parked ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {needsApproval ? (
                <GradientButton
                  onClick={() => {
                    parkOffer(offer.id);
                    router.push("/approvals");
                  }}
                >
                  <Icon name="send" size={15} strokeWidth={2} />
                  Send for approval
                </GradientButton>
              ) : (
                <GradientButton onClick={() => acceptOffer(offer.id)}>
                  <Icon name="check" size={15} strokeWidth={2.2} />
                  Accept
                </GradientButton>
              )}
              <HairlineButton onClick={() => declineOffer(offer.id)}>Decline</HairlineButton>
            </div>
            <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
              {needsApproval
                ? "Accepting this kind of credential needs one approver, so it goes to the queue rather than through."
                : "This is within your authority, so it goes straight into the entity's wallet — and into the record, as the entity's action carried out by you."}
            </p>
          </div>
        ) : null}
      </DetailLayout>
    </AppShell>
  );
}
