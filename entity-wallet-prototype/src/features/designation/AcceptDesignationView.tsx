"use client";

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
import { roleIn, type Designation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { daysLeft, dsgPill, kindsInWords } from "./shared";

/**
 * SCR-DSG-03 — What is being proposed. FLOW-ORG-02 A2: the authority's
 * consent, and the most consequential screen in UX-EW-02 — where a
 * government body understands what it is taking on.
 *
 * THE SENTENCE THAT MUST SURVIVE REVIEW UNCHANGED
 *
 * What NDI's access does and does not mean, including that NDI hosts the
 * organisation's keys (UXD-18). Stating only the permission the authority
 * controls would read as a technical guarantee that NDI cannot act, which
 * is false (EW-FLOW5-SD §7.3); a government body discovering the custodial
 * position later, having been given a stronger impression at the moment of
 * consent, is a governance failure. So the paragraph is the spec's, word
 * for word, and nothing here softens it.
 *
 * DECLINING IS A REAL ALTERNATIVE
 *
 * Consent needs one: decline sits beside accept, and says nothing is
 * created and NDI is told. And accepting doesn't switch anything on —
 * nothing happens in the authority's name until it agrees what people will
 * be asked — so the officer doesn't leave thinking the obligation began.
 */
type Face = "live" | "default" | "loading" | "empty" | "error" | "success" | "offline" | "no_permission";

export function AcceptDesignationView({ id }: { id: string }) {
  const router = useRouter();
  const { designations, organizations, currentPerson, personById, acceptDesignation, declineDesignation, hydrated } = useDemo();
  const forced = useScreenState("SCR-DSG-03", ["live", "default", "loading", "empty", "error", "success", "offline", "no_permission"]) as Face;

  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [failed, setFailed] = useState(false);
  const [outcome, setOutcome] = useState<"accepted" | "declined" | null>(null);

  const d: Designation | undefined = designations.find((x) => x.id === id);
  const org = organizations.find((o) => o.id === d?.orgId);
  const owner = org ? roleIn(org, currentPerson) === "Owner" : false;
  const ownerName = org ? Object.entries(org.roles ?? {}).find(([, r]) => r === "Owner")?.[0] : undefined;

  const natural: Face = !d
    ? "empty"
    : outcome
      ? "success"
      : !owner
        ? "no_permission"
        : "default";
  const face: Face = forced === "live" ? (busy ? "loading" : natural) : forced;
  const offline = face === "offline";
  const readOnly = offline || face === "no_permission";

  const header = (
    <PageHeader
      crumbs={[{ label: org?.name ?? "Your organisation" }, { label: "What is being proposed" }]}
      title="What is being proposed"
    />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  /* Something already decided, opened from an old link: say where it went. */
  if (forced === "live" && d && d.state !== "PENDING" && !outcome) {
    {
      const pill = dsgPill(d, "authority");
      return (
        <AppShell>
          <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
            {header}
            <Panel>
              <div className="relative z-[4] flex flex-col gap-3">
                <StatusPill status={pill.status} label={pill.label} />
                <p className="m-0 text-[14px] leading-[1.6] text-body">
                  {d.state === "DECLINED"
                    ? "You've declined. Nothing was created and NDI has been told."
                    : d.state === "EXPIRED"
                      ? "This expired without being accepted. NDI would need to propose it again."
                      : "This has been accepted. Your authority console shows where it stands."}
                </p>
                {d.state === "ACTIVE" || d.state === "ACCEPTED" ? (
                  <div>
                    <GradientButton onClick={() => router.push("/authority")}>Go to your authority console</GradientButton>
                  </div>
                ) : null}
              </div>
            </Panel>
          </div>
        </AppShell>
      );
    }
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="fileText" title="Nothing to review" message="NDI hasn't proposed anything for your organisation." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const shown: Designation =
    d ??
    ({
      id,
      orgId: "org-moice",
      orgName: "Ministry of Industry, Commerce & Employment",
      kind: "E",
      entityTypes: ["sole_proprietorship", "partnership"],
      legalBasis: "The licensing of businesses under the Ministry's mandate",
      legalRef: "NDI/DSG/2026/002",
      state: "PENDING",
      proposedBy: "tshering",
      proposedAt: null,
      approvedBy: "tshendu",
      approvedAt: null,
      acceptedBy: null,
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
    } satisfies Designation);
  const name = shown.orgName;
  const types = kindsInWords(shown.entityTypes);

  const accept = () => {
    setBusy(true);
    setFailed(false);
    window.setTimeout(() => {
      if (forced === "error") {
        setBusy(false);
        setFailed(true);
        return;
      }
      const r = acceptDesignation(shown.id);
      setBusy(false);
      if (!r.ok) {
        setFailed(true);
        return;
      }
      setOutcome("accepted");
    }, LOCAL_MS);
  };

  if (face === "success") {
    const declined = outcome === "declined";
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-center gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} style={{ color: "var(--ndi-success)" }} />
                {declined ? "You've declined. Nothing is created and NDI has been told." : `${name} has accepted.`}
              </p>
              {declined ? null : (
                <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-muted">
                  Nothing is live yet. NDI finishes switching this on, and then you agree what people
                  will be asked, for each kind of business. Until you do, nobody can verify with you.
                </p>
              )}
              {declined ? null : (
                <div>
                  <GradientButton onClick={() => router.push("/authority")}>
                    Continue to your authority console
                    <Icon name="arrowRight" size={16} strokeWidth={2} />
                  </GradientButton>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {failed || face === "error" ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13px]" style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}>
            Your decision wasn&rsquo;t recorded. Nothing has changed — try again.
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so this is read-only. You can still print it.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">What this means</p>
              <p className="m-0 max-w-[66ch] text-[15px] leading-[1.65] text-body">
                NDI is asking {name} to be the authority that confirms {types} on the platform. When a
                business says it is registered with you, you are the one who answers.
              </p>
            </div>

            <DetailList
              items={[
                { label: "You would confirm", value: types },
                { label: "Legal basis", value: shown.legalBasis },
                ...(shown.legalRef ? [{ label: "Reference", value: shown.legalRef, mono: true }] : []),
                { label: "Proposed by", value: shown.proposedBy ? `${personById(shown.proposedBy).name}, NDI` : "NDI" },
                { label: "Approved by", value: shown.approvedBy ? `${personById(shown.approvedBy).name}, NDI` : "NDI" },
                { label: "Time to decide", value: `${daysLeft(shown.expiresAt) || 30} days${shown.expiresAt ? `, until ${formatDate(shown.expiresAt)}` : ""}` },
              ]}
            />

            <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">NDI&rsquo;s access</p>
              <p className="m-0 max-w-[68ch] text-[13.5px] leading-[1.65] text-body">
                To ask a person for their identity on your behalf, NDI&rsquo;s service account will be added
                to your organisation as a verifier. You can see it in your members list and remove it at
                any time, without asking us. That account can only send the request you approve. NDI
                hosts your organisation&rsquo;s keys, as it does for every organisation on the platform —
                so this is a permission you control, not a technical barrier.
              </p>
            </div>

            <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-body">
              Accepting this doesn&rsquo;t switch anything on. Nothing happens in your name until you agree
              what people will be asked.
            </p>
            <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
              You can decline. Nothing is created and NDI is told.
            </p>

            {face === "no_permission" ? (
              <p role="status" className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="lockRounded" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                Only {ownerName ? personById(ownerName).name : "your organisation's owner"}, who owns {name} on the
                platform, can accept or decline this.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={accept} disabled={readOnly || busy}>
                {busy ? "Recording…" : "Accept"}
              </GradientButton>
              <HairlineButton onClick={() => setDeclining(true)} disabled={readOnly || busy}>
                Decline
              </HairlineButton>
              <HairlineButton onClick={() => window.print()}>Print what is being proposed</HairlineButton>
            </div>
          </div>
        </Panel>

        <Dialog
          open={declining}
          onClose={() => setDeclining(false)}
          title={`Decline for ${name}?`}
          lead={`${name} won't confirm ${types} on the platform. Nothing is created, and NDI is told.`}
          confirmLabel="Decline"
          onConfirm={() => {
            const r = declineDesignation(shown.id);
            setDeclining(false);
            if (r.ok) setOutcome("declined");
            else setFailed(true);
          }}
        />
      </div>
    </AppShell>
  );
}
