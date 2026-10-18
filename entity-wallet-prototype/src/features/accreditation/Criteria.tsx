"use client";

import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { OBSERVED_OPERATORS, type Accreditation, type Organization } from "@/lib/demoData";

/**
 * NDI's interim criteria, each beside the evidence an administrator looks
 * at (EW-FLOW4-SD §9). Shown on both administrator screens — SCR-ACC-05
 * reviews against them and SCR-ACC-02 decides against them — so the second
 * administrator sees what the first was looking at rather than taking the
 * recommendation on trust.
 *
 * Not ticked off here. Whether a purpose is "specific and lawful" is a
 * judgement, and a checkbox the administrator ticks would record that they
 * clicked, not that they judged — the decision with their name on it is the
 * record. The criteria are what the decision is made against.
 *
 * The ids (C1–C7) are kept in this comment, not on the screen: an
 * administrator does this a handful of times and reads the criterion, not a
 * code for it.
 */
export function Criteria({
  acc,
  org,
  overlaps,
}: {
  acc: Accreditation;
  org: Organization | undefined;
  overlaps: { type: string; others: string[] }[];
}) {
  const rows: { criterion: string; evidence: string }[] = [
    {
      criterion: "It's an identifiable body under Bhutanese law",
      evidence:
        acc.door === "REQUEST"
          ? `Verified by its registering authority${org?.createdAt ? ` · on the platform since ${formatDate(org.createdAt)}` : ""}`
          : acc.door === "NEW"
            ? "Its constituting registration, cited when it registers"
            : `${acc.orgName} — on the platform${org?.createdAt ? ` since ${formatDate(org.createdAt)}` : ""}`,
    },
    {
      criterion: "A named officer accepts accountability",
      evidence:
        acc.door === "REQUEST"
          ? "Asked by the person recorded as its representative"
          : "Its owner accepts with their NDI wallet, by name",
    },
    { criterion: "The purpose is specific and lawful", evidence: acc.purpose || "—" },
    {
      criterion: "It has an agreement with NDI",
      evidence: acc.agreementRef || (acc.door === "REQUEST" ? "Not given — may follow approval" : "Not given"),
    },
    {
      criterion: "It asks for no more than its purpose needs",
      evidence:
        acc.capability === "verifier"
          ? `${acc.ask.length} item${acc.ask.length === 1 ? "" : "s"}${acc.ask.some((a) => a.checkOnly) ? ", some check only" : ""}`
          : `${acc.issue.length} credential type${acc.issue.length === 1 ? "" : "s"}`,
    },
  ];
  if (acc.capability === "issuer") {
    rows.push(
      {
        criterion: "It has the mandate to attest what it issues",
        evidence: acc.issue.map((t) => `${t.name}: ${t.basis}`).join(" · ") || "—",
      },
      {
        criterion: "It doesn't duplicate another issuer, unless several are intended",
        evidence: overlaps.length
          ? overlaps.map((o) => `${o.type} is also issued by ${o.others.join(", ")}`).join(" · ")
          : "No other organisation issues these",
      },
    );
  }
  return (
    <dl className="m-0 flex flex-col gap-3">
      {rows.map((r) => (
        <div key={r.criterion} className="flex flex-col gap-0.5 min-[761px]:grid min-[761px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] min-[761px]:gap-4">
          <dt className="flex items-start gap-2 text-[13.5px] leading-[1.55] text-body">
            <Icon name="info" size={14} strokeWidth={2} className="mt-[4px] flex-none text-faint" />
            {r.criterion}
          </dt>
          <dd className="m-0 pl-[22px] text-[13px] leading-[1.55] text-muted min-[761px]:pl-0">{r.evidence}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * P5 — credential types another organisation already issues, shown beside
 * the type. Not an error and not a refusal: a type named in words cannot
 * be matched mechanically, and several universities each issuing degrees
 * is intended (EW-FLOW4-SD §9, C7). Matched on the name, loosely.
 */
export function issueOverlaps(acc: Pick<Accreditation, "orgId" | "issue">, all: Accreditation[], orgName: (id: string) => string) {
  const norm = (s: string) => s.trim().toLowerCase();
  return acc.issue
    .map((t) => {
      const others = [
        ...all
          .filter((a) => a.orgId !== acc.orgId && a.capability === "issuer" && a.state === "ACTIVE" && a.issue.some((x) => norm(x.name) === norm(t.name)))
          .map((a) => a.orgName),
        ...OBSERVED_OPERATORS.filter((o) => o.orgId !== acc.orgId && o.issue.some((x) => norm(x.name) === norm(t.name))).map((o) => orgName(o.orgId)),
      ];
      return { type: t.name, others: others.filter((v, i, a) => a.indexOf(v) === i) };
    })
    .filter((o) => o.others.length);
}
