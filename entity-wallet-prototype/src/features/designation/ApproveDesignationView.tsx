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
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { isNamedAdmin, type Designation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { daysLeft, dsgPill, kindSingular, kindsInWords } from "./shared";

/**
 * SCR-DSG-02 — Approve a designation. FLOW-ORG-02 A1: dual control, for a
 * task done a handful of times in the platform's life by someone with no
 * routine for it — deliberately the same shape as SCR-INV-02 and
 * SCR-ACC-02 (UX-EW-02 §3.2).
 *
 * THE CONTROL YOU MAY NOT USE IS NOT OFFERED
 *
 * The proposer sees the whole proposal with approve disabled and the
 * reason in its place — never enabled and refused on press (E7, UC-15).
 * Refuse is disabled too; withdrawing is what is left. The store refuses
 * regardless, and logs the attempt.
 *
 * THE CONSEQUENCE AT THE MOMENT OF DECISION
 *
 * The confirmation states what approving does in outcome words: the
 * organisation will create the credential that makes these businesses
 * real, and everyone on the platform will trust what it issues (SC 3.3.4).
 *
 * Also the record of a designation in its later states, because an
 * administrator following one up arrives at the same address.
 */
type Face = "live" | "default" | "self_proposed" | "expired" | "loading" | "error" | "success" | "offline" | "empty";

export function ApproveDesignationView({ id }: { id: string }) {
  const router = useRouter();
  const { designations, organizations, people, currentPerson, harness, personById, decideDesignation, withdrawDesignation, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-DSG-02", [
    "live",
    "default",
    "self_proposed",
    "expired",
    "loading",
    "error",
    "success",
    "offline",
    "empty",
  ]) as Face;

  const [confirming, setConfirming] = useState<"approve" | "refuse" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const live = designations.find((d) => d.id === id);
  const sample: Designation | undefined =
    live ??
    (forced !== "live" && forced !== "empty"
      ? {
          id,
          orgId: "org-moice",
          orgName: "Ministry of Industry, Commerce & Employment",
          kind: "E",
          entityTypes: ["sole_proprietorship", "partnership"],
          legalBasis: "The licensing of businesses under the Ministry's mandate",
          legalRef: "NDI/DSG/2026/002",
          state: "PROPOSED",
          proposedBy: "tshering",
          proposedAt: new Date().toISOString().slice(0, 10),
          approvedBy: null,
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
        }
      : undefined);
  const d: Designation | undefined = sample && forced === "expired" ? { ...sample, state: "EXPIRED" } : sample;

  const natural: Face = !d
    ? "empty"
    : done
      ? "success"
      : d.state === "EXPIRED"
        ? "expired"
        : d.state === "PROPOSED" && d.proposedBy === harness.persona
          ? "self_proposed"
          : "default";
  const face: Face = forced === "live" ? natural : forced;
  const offline = face === "offline";
  const isRoot = currentPerson.platformRole === "root";
  const canAct = isNamedAdmin(currentPerson) && !offline && !busy;

  const header = (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Designations", href: "/admin/designations" }, { label: d?.orgName ?? "Designation" }]}
      title="Approve a designation"
    />
  );

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (face === "empty" || !d) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="userCheck" title="Nothing is waiting for your approval." message="Designations a colleague proposes come here for a second administrator." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const org = organizations.find((o) => o.id === d.orgId);
  const pill = dsgPill(d, "admin");
  const whoCan = people
    .filter((p) => isNamedAdmin(p) && p.hasAccount !== false && p.id !== d.proposedBy)
    .map((p) => p.name);
  const proposedHere = d.state === "PROPOSED" && face !== "expired";

  const decide = (approve: boolean) => {
    setBusy(true);
    setFailed(false);
    window.setTimeout(() => {
      if (forced === "error") {
        setBusy(false);
        setFailed(true);
        setConfirming(null);
        return;
      }
      const r = decideDesignation(d.id, approve, reason);
      setBusy(false);
      setConfirming(null);
      if (!r.ok) {
        setFailed(true);
        return;
      }
      setDone(
        approve
          ? `Approved. ${d.orgName} has been asked to accept, and has 30 days to.`
          : `Refused. ${d.orgName} isn't told — nothing was ever sent to it.`,
      );
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        {header}

        {face === "success" ? (
          <p role="status" className="m-0 flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body">
            <Icon name="check" size={14} strokeWidth={2.4} style={{ color: "var(--ndi-success)" }} />
            {done ?? `Approved. ${d.orgName} has been asked to accept, and has 30 days to.`}
          </p>
        ) : null}
        {failed || face === "error" ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13px]" style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}>
            Your decision wasn&rsquo;t recorded — nothing changed. Try again.
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so this is read-only. Deciding is switched off until you&rsquo;re back.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="m-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Designation proposed</p>
                <p className="m-0 font-display text-[18px] font-semibold text-strong">{d.orgName}</p>
              </div>
              <StatusPill status={face === "expired" ? "lapsed" : pill.status} label={face === "expired" ? "Expired" : pill.label} />
            </div>
            <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
              {d.orgName} would become the authority that confirms {kindsInWords(d.entityTypes)} on the
              platform: when a business says it is registered with them, they answer.
            </p>
            <DetailList
              items={[
                { label: "Legal identity", value: org?.legalName ?? d.orgName },
                { label: "Will confirm", value: kindsInWords(d.entityTypes) },
                { label: "Legal basis", value: d.legalBasis },
                ...(d.legalRef ? [{ label: "Reference", value: d.legalRef, mono: true }] : []),
                {
                  label: "Proposed by",
                  value: d.proposedBy ? `${personById(d.proposedBy).name}${d.proposedAt ? `, ${formatDate(d.proposedAt)}` : ""}` : "Before this platform's administrators",
                },
                ...(d.approvedBy ? [{ label: d.state === "REFUSED" ? "Refused by" : "Approved by", value: `${personById(d.approvedBy).name}${d.approvedAt ? `, ${formatDate(d.approvedAt)}` : ""}` }] : []),
                ...(d.acceptedAt ? [{ label: "Accepted", value: `${d.acceptedBy ? `${personById(d.acceptedBy).name}, ` : ""}${formatDate(d.acceptedAt)}` }] : []),
                ...(d.activatedAt ? [{ label: "Switched on", value: formatDate(d.activatedAt) }] : []),
              ]}
            />
            {d.state === "PENDING" ? (
              <p className="m-0 text-[13.5px] text-body">The organisation has {daysLeft(d.expiresAt)} days to accept this.</p>
            ) : null}
            {d.state === "REFUSED" && d.refusedReason ? (
              <p className="m-0 text-[13.5px] text-body">Reason: {d.refusedReason}</p>
            ) : null}
            {d.state === "ACCEPTED" ? (
              <p className="m-0 text-[13.5px] text-body">
                Accepted, but not every activation check passes yet.{" "}
                <Link className="ndi-plainlink font-medium text-accent" href={`/admin/designations/${d.id}/activation`}>
                  See the checks
                </Link>
              </p>
            ) : null}
            {d.state === "ACTIVE" && d.ndiAccess === "REMOVED" ? (
              <p className="m-0 text-[13.5px] text-body">
                {d.orgName} has withdrawn the platform&rsquo;s permission to request proofs in its name. Contact
                the authority if this wasn&rsquo;t expected.
              </p>
            ) : null}
            {face === "expired" ? (
              <p role="status" className="m-0 text-[13.5px] text-body">
                This designation expired without being accepted. A new one needs a fresh second approval.
              </p>
            ) : null}

            {isRoot && proposedHere ? (
              <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
                The root account doesn&rsquo;t approve anything. {whoCan.length ? `${whoCan.join(" or ")} can.` : ""}
              </p>
            ) : null}

            {proposedHere && face !== "success" ? (
              face === "self_proposed" ? (
                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                    <Icon name="lockRounded" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                    You proposed this designation, so a different administrator has to approve it.
                  </p>
                  <p className="m-0 text-[13px] text-muted">{whoCan.length ? `${whoCan.join(" or ")} can.` : "No other administrator has an account yet."}</p>
                  <div className="flex flex-wrap gap-2.5">
                    <GradientButton disabled aria-describedby="why-approve">
                      Approve
                    </GradientButton>
                    <HairlineButton disabled>Refuse</HairlineButton>
                    <HairlineButton
                      disabled={offline}
                      onClick={() => {
                        withdrawDesignation(d.id);
                        router.push("/admin/designations");
                      }}
                    >
                      Withdraw it
                    </HairlineButton>
                  </div>
                  <span id="why-approve" className="sr-only">
                    Approve is unavailable because you proposed this.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <p className="m-0 text-[13px] leading-[1.6] text-muted">
                    Approving asks {d.orgName} to accept. Refusing means it is never asked.
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <GradientButton onClick={() => setConfirming("approve")} disabled={!canAct}>
                      <Icon name="check" size={15} strokeWidth={2.2} />
                      Approve
                    </GradientButton>
                    <HairlineButton onClick={() => setConfirming("refuse")} disabled={!canAct}>
                      Refuse
                    </HairlineButton>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </Panel>

        {face === "expired" ? (
          <div>
            <GradientButton onClick={() => router.push("/admin/designations/new")}>Propose again</GradientButton>
          </div>
        ) : null}

        <Dialog
          open={confirming === "approve"}
          onClose={() => setConfirming(null)}
          title={`Approve ${d.orgName}?`}
          lead={`This organisation will be able to create the credential that makes a ${d.entityTypes.map(kindSingular).join(" or a ")} real. Everyone on the platform will trust what it issues.`}
          consequences={[
            `${d.orgName} is asked to accept, and has 30 days to`,
            "It is recorded with your name as the second administrator — permanently",
            "Nothing switches on until it accepts and the activation checks pass",
          ]}
          confirmLabel={busy ? "Recording…" : "Approve"}
          confirmDisabled={busy}
          onConfirm={() => decide(true)}
        />
        <Dialog
          open={confirming === "refuse"}
          onClose={() => setConfirming(null)}
          tone="danger"
          title={`Refuse ${d.orgName}?`}
          lead="It is never sent. If it should go ahead later, it has to be proposed again — and approved again."
          confirmLabel={busy ? "Recording…" : "Refuse"}
          confirmDisabled={busy || !reason.trim()}
          onConfirm={() => decide(false)}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason, for the proposer</span>
            <textarea className={`${FIELD_CLASS} resize-y py-3`} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}
