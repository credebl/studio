"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { useHolder } from "./shared";

/**
 * SCR-CRD-06 — <Issuer> is asking for more. FLOW-CRD-01 A1: the issuer's
 * proof request asks for more than the consent on SCR-CRD-02 covered.
 *
 * TWO LISTS, NEVER ONE
 *
 * What was agreed, then — separately, in words — what is asked now. The
 * merged list ("they'd like: registration, bank account") is shorter and
 * hides exactly the thing this screen exists to show: which part is new
 * (UN-39, UC-28). Nothing beyond the agreement leaves the wallet until
 * someone here says so.
 *
 * NOT SHARING IS A REAL ANSWER
 *
 * It withdraws the request, and says so on the button. The issuer stops
 * waiting on a date (FLOW-CRD-03 E4), which is shown, so silence is also a
 * choice with a known outcome.
 */
type Face = "live" | "default" | "loading" | "expired" | "offline" | "no_permission";

export function AskingForMoreView({ requestId }: { requestId: string }) {
  const router = useRouter();
  const { credentialRequests, answerAskForMore, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-06", ["live", "default", "loading", "expired", "offline", "no_permission"]) as Face;
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const r = credentialRequests.find((x) => x.id === requestId);
  const lapsed = r?.consentBy ? r.consentBy < new Date().toISOString().slice(0, 10) : false;
  const natural: Face = busy ? "loading" : lapsed ? "expired" : failed ? "offline" : !holder.can("credential:receive") ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const issuer = r?.issuerName ?? "The issuer";
  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Requests and offers", href: "/wallet/requests" }, { label: r?.credential ?? "Request" }]}
      title={`${issuer} is asking for more than it said`}
    />
  );

  /* Answered already, or never asked: there's nothing to decide here. */
  if (!r || (r.state !== "NEEDS_CONSENT" && forced === "live")) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p className="m-0 text-[14px] text-body">
                {r?.state === "WITHDRAWN" ? "You've withdrawn this request." : "There's nothing waiting for your answer on this request."}
              </p>
              <div>
                <HairlineButton onClick={() => router.push(r ? `/wallet/requests/${r.id}` : "/wallet/requests")}>See where it stands</HairlineButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "expired") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="alert" className="m-0 text-[14px] text-body">
                {issuer} stopped waiting for your answer. You can ask again.
              </p>
              <div>
                <GradientButton onClick={() => router.push(`/wallet/get/${r.offeringId}`)}>Ask again</GradientButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const answer = (share: boolean) => {
    if (forced === "offline") {
      setFailed(true);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      answerAskForMore(r.id, share);
      setBusy(false);
      router.push(`/wallet/requests/${r.id}`);
    }, LOCAL_MS);
  };

  const more = r.askedMore ?? { credential: "Bank account", items: ["Account holder", "Account number", "Bank"] };
  const readOnly = face === "no_permission";

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            That didn&rsquo;t go through, so nothing was sent. Try again when you&rsquo;re back online.
          </p>
        ) : null}
        {readOnly ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {holder.rootName} can answer this.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <section aria-labelledby="more-agreed" className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3">
              <h2 id="more-agreed" className={LABEL_CLASS}>
                You agreed to share
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                Your {r.consented.credential}: {r.consented.attributes.join(", ")}.
              </p>
            </section>
            <section
              aria-labelledby="more-asked"
              className="flex flex-col gap-1.5 rounded-[12px] border px-4 py-3"
              style={{ borderColor: "var(--ndi-warning)" }}
            >
              <h2 id="more-asked" className={LABEL_CLASS}>
                {issuer} is now also asking for
              </h2>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                Your {more.credential}: {more.items.join(", ")}.
              </p>
              <p className="m-0 text-[12.5px] text-muted">This wasn&rsquo;t in what you agreed to. Nothing more has been sent.</p>
            </section>
            {r.consentBy ? (
              <p className="m-0 text-[13px] text-muted">
                {issuer} stops waiting on {formatDate(r.consentBy)}. If nobody answers by then, the request is withdrawn.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={() => answer(true)} disabled={readOnly || face === "loading"}>
                Share this too
              </GradientButton>
              <HairlineButton onClick={() => answer(false)} disabled={readOnly || face === "loading"}>
                Don&rsquo;t share — withdraw the request
              </HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
