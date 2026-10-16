"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { roleIn, type OrgInvitation } from "@/lib/demoData";
import { presetOf } from "@/features/appointment/presets";
import { useDemo } from "@/lib/demoStore";

import { PendingInvitations } from "./PendingInvitations";

/**
 * Members of the organisation — FLOW-ONB-02's Kind M home, and the entry to
 * SCR-INV-01 and SCR-INV-03.
 *
 * TWO COLUMNS THAT MUST NEVER BE READ AS ONE
 *
 * "Role" is membership: who can sign in and see the organisation. "Authority
 * to act" is controllership: who may bind it, granted separately and
 * accepted (Flow 3). Membership is routinely mistaken for authority — the
 * reason FLOW-ONB-02 Q4 and UXD-04 exist — so they sit side by side and a
 * member with no authority says so in words, rather than leaving an empty
 * cell for someone to read as "not relevant".
 *
 * Identity is a third, separate fact. A person who joined by invitation has
 * not been checked against the register — anchoring happens when someone
 * takes on accountability, not when they join (Flow 1 design D3) — and act 2
 * will refuse to grant them authority until it has.
 */
export function MembersView() {
  const { people, relations, orgInvitations, organizations, activeOrgId, currentPerson, delegatedAuthorities } = useDemo();

  const forced = useScreenState("SCR-INV-03", ["default", "loading", "empty", "delivery_failed", "offline", "read_only"]);

  const org = organizations.find((o) => o.id === activeOrgId);
  /* This organisation's members, each at the role they hold *here* (roleIn).
     It used to be everyone with a role anywhere, which on a
     multi-organisation platform (AC-10) is somebody else's staff. */
  const members = people
    .filter((p) => p.hasAccount !== false && roleIn(org, p))
    .map((p) => ({ ...p, role: roleIn(org, p) }));
  const myRole = roleIn(org, currentPerson);
  const canInvite = forced !== "read_only" && (myRole === "Owner" || myRole === "Admin");

  const live = orgInvitations.filter(
    (i) => i.kind === "M" && i.orgId === activeOrgId && (i.state === "PENDING" || i.state === "PENDING_APPROVAL"),
  );
  /* E8 is only ever seen here, and on a first day nothing has bounced — so
     the state switcher shows one bounced invitation for review, rather than
     leaving the one failure this list exists to surface unreachable. */
  const bounced: OrgInvitation = {
    id: "inv-review-bounce",
    kind: "M",
    email: "tashi.dema@pelden-trading.bt",
    orgId: activeOrgId,
    role: "Member",
    legalName: null,
    legalIdentity: null,
    purpose: null,
    needsSecondApproval: false,
    invitedBy: currentPerson.id,
    approvedBy: null,
    createdAt: live[0]?.createdAt ?? new Date().toISOString().slice(0, 10),
    sentAt: new Date().toISOString().slice(0, 10),
    expiresAt: new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10),
    state: "PENDING",
    delivery: "failed",
    decidedAt: null,
    acceptedName: null,
  };
  const pending =
    forced === "empty" ? [] : forced === "delivery_failed" && !live.some((i) => i.delivery === "failed") ? [bounced, ...live] : live;

  /* Membership and authority side by side: what each person may do for the
     organisation, by whichever route it was granted — a controllership they
     accepted, or a role or capability in their own wallet — and an
     appointment still waiting on them, so the owner can see it is not yet in
     force. */
  const authorityOf = (personId: string) => {
    const r = relations.find((rel) => rel.personId === personId && rel.state === "ACTIVE");
    if (r) return r.isRootAuthority ? "Representative" : `Can act · ${presetOf(r.preset)?.label ?? "set individually"}`;
    const held = delegatedAuthorities.filter(
      (a) => a.recipientId === personId && a.status === "ACTIVE" && a.acceptance === "accepted",
    );
    if (held.length) return `Role in their wallet · ${held.map((a) => a.title).join(", ")}`;
    const waiting =
      relations.some((rel) => rel.personId === personId && rel.state === "PENDING_ACCEPTANCE") ||
      delegatedAuthorities.some((a) => a.recipientId === personId && a.status === "ACTIVE" && a.acceptance === "sent");
    return waiting ? "Appointed — waiting for them to accept" : null;
  };

  const inviteButton = canInvite ? (
    <Link href="/members/invite">
      <GradientButton>
        <Icon name="plus" size={15} strokeWidth={2} />
        Invite someone
      </GradientButton>
    </Link>
  ) : undefined;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Members" }]} title={`Members of ${org?.name ?? "the organisation"}`} actions={inviteButton} />

        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          Everyone who can sign in and see this organisation. Being a member does not let anyone
          act for it — that is given separately, and accepted by the person, under People who can act.
        </p>

        <Panel padded={false}>
          {forced === "loading" ? (
            <div aria-hidden="true" className="flex flex-col gap-2 p-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-[8px] bg-[rgb(var(--tint)/0.04)]" />
              ))}
            </div>
          ) : (
            <DataTable columns={["Member", "Role", "Identity", "Authority to act"]}>
              {members.map((m) => {
                const authority = authorityOf(m.id);
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="flex flex-col">
                        <span className="text-body">{m.name}</span>
                        <span className="text-[12px] text-faint">{m.email}</span>
                      </span>
                    </td>
                    <td className="text-body">{m.role}</td>
                    <td>
                      <StatusPill
                        status={m.cidVerified ? "verified" : "pending"}
                        label={m.cidVerified ? "Identity confirmed" : "Not yet confirmed"}
                      />
                    </td>
                    <td>
                      {authority ? (
                        <Link
                          href={authority.startsWith("Role in") ? "/delegated-authority" : "/people-who-can-act"}
                          className="ndi-plainlink text-body"
                        >
                          {authority}
                        </Link>
                      ) : (
                        <span className="text-muted">None — membership only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </Panel>

        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[16px] font-semibold text-strong">Invitations waiting</h2>
          <Panel padded={false}>
            {forced === "loading" ? (
              <div aria-hidden="true" className="h-24 animate-pulse" />
            ) : (
              <PendingInvitations
                rows={pending}
                kind="M"
                readOnly={!canInvite}
                offline={forced === "offline"}
                compactEmpty
              />
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
