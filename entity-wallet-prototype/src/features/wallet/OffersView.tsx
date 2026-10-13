"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Countdown } from "@/components/ui/Countdown";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { inOrg, shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * The holder's inbox. The plan calls this the biggest gap in the studio, and
 * it is: the product was issuer and verifier only, with nowhere for a
 * credential offered *to* the organisation to arrive.
 *
 * The decision column is what makes it more than a list. Every row already
 * carries the server's answer — in scope, needs an approver, or refused — so
 * a Controller can see before opening anything which of these they can
 * actually deal with. Finding out only after clicking in is how a queue
 * becomes a chore.
 */
export function OffersView() {
  const { offers, activeOrgId, organizations } = useDemo();
  const orgName = organizations.find((o) => o.id === activeOrgId)?.name.replace(/ Pvt\. Ltd\.$/, "") ?? "the organisation";

  const variant = useScreenState("B4-list", ["populated", "empty"]);
  const rows = variant === "empty" ? [] : offers.filter(inOrg(activeOrgId));

  const open = rows.filter((o) => o.state === "pending" || o.state === "parked");

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Wallet" }, { label: "Offers" }]}
          title="Credential offers"
          actions={
            open.length > 0 ? (
              <StatusPill
                status="pending"
                label={`${open.length} waiting on you`}
              />
            ) : null
          }
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Credentials other organisations have offered to {shortOrgName(orgName)}.
          What each one contains is read from the offer itself, not from
          anything anyone typed here.
        </p>

        <Panel padded={false}>
          <DataTable
            columns={["Credential", "Issuer", "Expires", "Can you accept it?", "State", ""]}
            empty={{
              icon: "download",
              title: "No offers",
              message:
                "When an issuer offers the entity a credential, it arrives here for a controller to review.",
            }}
          >
            {rows.map((offer) => (
              <tr key={offer.id}>
                <td className="text-body">{offer.type}</td>
                <td>{offer.issuer}</td>
                <td>
                  {offer.state === "expired" ? (
                    <span className="text-faint">Expired</span>
                  ) : (
                    <Countdown expiresAt={offer.expiresAt} />
                  )}
                </td>
                <td>
                  <StatusPill
                    status={offer.decision}
                    label={
                      offer.decision === "allowed"
                        ? "Yes"
                        : offer.decision === "requires_approval"
                          ? "Needs an approver"
                          : "Out of your scope"
                    }
                  />
                </td>
                <td>
                  <StatusPill status={offer.state} />
                </td>
                <td>
                  {offer.state === "pending" || offer.state === "parked" ? (
                    <Link
                      href={`/wallet/offers/${offer.id}`}
                      className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-muted"
                    >
                      Review
                    </Link>
                  ) : (
                    <Link
                      href={`/wallet/offers/${offer.id}`}
                      className="ndi-plainlink whitespace-nowrap text-[12.5px] font-medium text-faint"
                    >
                      Open
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </AppShell>
  );
}
