"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * Inbound requests for the entity to prove something about itself.
 *
 * These are portal tasks, not deep links, and the copy says so. The entity
 * has no phone: a relying party asking Pelden Trading for a proof cannot
 * send a QR anywhere, so the request lands in the console for a controller to
 * answer on the entity's behalf. Keeping that distinct from the person-held
 * wallet flow is one of the two mental models the brief insists must not
 * blur.
 */
export function VerificationRequestsView() {
  const { verificationRequests, activeOrgId, organizations } = useDemo();
  const orgName = organizations.find((o) => o.id === activeOrgId)?.name.replace(/ Pvt\. Ltd\.$/, "") ?? "the organisation";

  const variant = useScreenState("B5-list", ["populated", "empty"]);
  const rows = variant === "empty" ? [] : verificationRequests.filter(inOrg(activeOrgId));

  const open = rows.filter((r) => r.state === "ready" || r.state === "parked");

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Wallet" }, { label: "Verification requests" }]}
          title="Requests to prove something"
          actions={
            open.length > 0 ? (
              <StatusPill status="pending" label={`${open.length} waiting on you`} />
            ) : null
          }
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Relying parties asking {orgName} to prove something about
          itself. These arrive here rather than on anyone&rsquo;s phone — the
          entity has no device, so a controller answers on its behalf.
        </p>

        <Panel padded={false}>
          <DataTable
            columns={["Relying party", "Asking for", "Expires", "Can you answer it?", "State", ""]}
            empty={{
              icon: "verify",
              title: "Nothing to answer",
              message:
                "When a bank, a counterparty or an agency asks the entity to prove something, the request appears here.",
            }}
          >
            {rows.map((request) => (
              <tr key={request.id}>
                <td>
                  <span className="flex flex-col">
                    <span className="text-body">{request.relyingParty}</span>
                    {!request.relyingPartyTrusted ? (
                      <span className="text-[12px] text-faint">Not on the trust registry</span>
                    ) : null}
                  </span>
                </td>
                <td>
                  <span className="flex flex-col">
                    <span className="text-body">{request.credentialType}</span>
                    <span className="text-[12px] text-faint">
                      {request.requestedAttributes.length} attributes ·{" "}
                      {request.requiredAttributes.length} actually needed
                    </span>
                  </span>
                </td>
                <td>
                  {request.state === "expired" ? (
                    <span className="text-faint">Expired</span>
                  ) : (
                    <Countdown expiresAt={request.expiresAt} />
                  )}
                </td>
                <td>
                  <StatusPill
                    status={request.decision}
                    label={
                      request.decision === "allowed"
                        ? "Yes"
                        : request.decision === "requires_approval"
                          ? "Needs an approver"
                          : "Not permitted"
                    }
                  />
                </td>
                <td>
                  <StatusPill status={request.state} />
                </td>
                <td>
                  <Link
                    href={`/wallet/verification-requests/${request.id}`}
                    className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted"
                  >
                    {request.state === "ready" ? "Answer" : "Open"}
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
