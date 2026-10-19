"use client";

import { roleIn } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * The issuer's side of Flow 6 (FLOW-CRD-03), from inside the issuing
 * office: the Department of Revenue & Customs, with Deki as both its
 * officer and its owner on the platform.
 *
 * Two different permissions, kept apart even though one person holds both
 * here. Answering requests is the OrgRoles.ISSUER user role — membership of
 * the office, for the prototype — and changing what's offered, or the
 * integration, is the office's OWNER. A demo with one person in the office
 * would hide that distinction if the screens asked one question for both.
 */
export function useIssuer() {
  const { organizations, activeOrgId, currentPerson, offerings } = useDemo();
  const org = organizations.find((o) => o.id === activeOrgId && offerings.some((x) => x.issuerOrgId === o.id));
  return {
    org,
    name: org?.name ?? "Your office",
    isOfficer: Boolean(org?.memberIds.includes(currentPerson.id)),
    isOwner: org ? roleIn(org, currentPerson) === "Owner" : false,
    offerings: offerings.filter((o) => o.issuerOrgId === org?.id),
  };
}
