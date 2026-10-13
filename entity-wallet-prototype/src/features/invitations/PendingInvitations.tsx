"use client";

import { useRouter } from "next/navigation";

import { Countdown } from "@/components/ui/Countdown";
import { DataTable } from "@/components/ui/DataTable";
import { SimulatedLink } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import type { OrgInvitation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * SCR-INV-03 — Pending invitations. FLOW-ONB-02 step 4.
 *
 * Delivery is asynchronous and never confirmed to the inviter (step 4), so
 * this list is the only place an invitation that bounced is ever visible
 * (E8). The failure is on the row, with the address shown so a typo can be
 * seen, and resend is right beside it.
 *
 * Revoke is always available before acceptance (S7) — an invitation is not
 * a promise, and an inviter who changes their mind should not have to wait
 * for one to expire.
 *
 * `readOnly` is the "Disabled / no permission" face: a role that may see
 * who is invited but not act on it gets the list without the actions — not
 * the actions greyed out.
 */
export function PendingInvitations({
  rows,
  kind,
  readOnly = false,
  offline = false,
  emptyAction,
  compactEmpty = false,
}: {
  rows: OrgInvitation[];
  kind: "M" | "O";
  readOnly?: boolean;
  offline?: boolean;
  emptyAction?: React.ReactNode;
  /** A one-line empty state, for a page that already offers the action. */
  compactEmpty?: boolean;
}) {
  const router = useRouter();
  const { resendInvitation, withdrawInvitation, personById } = useDemo();

  return (
    <>
      {offline ? (
        <p role="status" className="relative z-[4] border-b border-subtle px-5 py-3 text-[12.5px] text-muted">
          Showing the last list we had — it may be out of date, and nothing can be changed until
          you&rsquo;re back online.
        </p>
      ) : null}
      <DataTable
        columns={[
          "Invited",
          kind === "M" ? "Role" : "Organisation",
          "Sent",
          "Expires",
          "Status",
          "",
        ]}
        empty={{
          icon: "mail",
          title: "No one is waiting on an invitation",
          message:
            kind === "M"
              ? "When you invite someone into the organisation, they appear here until they accept."
              : "Invitations to organisations being brought onto the platform appear here until they are accepted.",
          action: emptyAction,
          compact: compactEmpty,
        }}
      >
        {rows.length > 0
          ? rows.map((inv) => {
              const failed = inv.delivery === "failed";
              const live = inv.state === "PENDING" || inv.state === "PENDING_APPROVAL";
              return (
                <tr key={inv.id}>
                  <td>
                    <span className="flex flex-col">
                      <span className="break-words text-body">{inv.email}</span>
                      <span className="text-[12px] text-faint">
                        by {personById(inv.invitedBy).name}
                        {inv.approvedBy ? ` · approved by ${personById(inv.approvedBy).name}` : ""}
                      </span>
                    </span>
                  </td>
                  <td>
                    {kind === "M" ? (
                      <span className="text-body">{inv.role}</span>
                    ) : (
                      <span className="flex max-w-[260px] flex-col">
                        <span className="text-body">{inv.legalName}</span>
                        <span className="text-[12px] leading-[1.45] text-faint">{inv.purpose}</span>
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-muted">{inv.sentAt ? formatDate(inv.sentAt) : "Not sent"}</td>
                  <td className="whitespace-nowrap">
                    {inv.state === "PENDING" && inv.expiresAt ? (
                      <Countdown expiresAt={inv.expiresAt} />
                    ) : (
                      <span className="text-faint">—</span>
                    )}
                  </td>
                  <td>
                    <span className="flex flex-col items-start gap-1">
                      <StatusPill
                        status={inv.state}
                        label={
                          inv.state === "PENDING_APPROVAL"
                            ? "Awaiting a second administrator"
                            : inv.state === "PENDING"
                              ? "Sent"
                              : undefined
                        }
                      />
                      {failed && live ? (
                        <StatusPill status="delivery_failed" label="Couldn't deliver" />
                      ) : null}
                    </span>
                  </td>
                  <td>
                    {live && !readOnly ? (
                      <span className="flex flex-wrap items-center justify-end gap-3">
                        {inv.state === "PENDING" ? (
                          <button
                            type="button"
                            disabled={offline}
                            onClick={() => resendInvitation(inv.id)}
                            className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-accent disabled:opacity-40"
                            aria-label={`Resend the invitation to ${inv.email}`}
                          >
                            Resend
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={offline}
                          onClick={() => withdrawInvitation(inv.id)}
                          className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted disabled:opacity-40"
                          aria-label={`${inv.state === "PENDING_APPROVAL" ? "Withdraw" : "Revoke"} the invitation to ${inv.email}`}
                        >
                          {inv.state === "PENDING_APPROVAL" ? "Withdraw" : "Revoke"}
                        </button>
                        {inv.state === "PENDING" && !failed ? (
                          <SimulatedLink onClick={() => router.push(`/invitation/${inv.id}`)}>
                            Open as the invitee
                          </SimulatedLink>
                        ) : null}
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })
          : undefined}
      </DataTable>
      {rows.some((r) => r.delivery === "failed" && r.state === "PENDING") && !offline ? (
        <p className="relative z-[4] border-t border-subtle px-5 py-3 text-[12.5px] leading-[1.5] text-muted">
          {rows
            .filter((r) => r.delivery === "failed" && r.state === "PENDING")
            .map((r) => (
              <span key={r.id} className="block">
                We couldn&rsquo;t deliver to <strong className="text-body">{r.email}</strong>. Check the
                address, then resend — or revoke it and invite the right one.
              </span>
            ))}
        </p>
      ) : null}
    </>
  );
}
