import { useId, type ReactNode } from "react";

import { issuerLook, type CardTint } from "@/lib/issuers";

import { StatusPill } from "./StatusPill";
import { Icon } from "./icons";

/**
 * A credential drawn as a card — the way people already picture one.
 *
 * WHY A CARD AND NOT A ROW
 *
 * Every wallet people use, the NDI Wallet included, shows a credential as a
 * card: the issuer's mark, the credential's name, the format it is in. The
 * console listed them as table rows, which made the entity's registration
 * look like a database record rather than the thing it is — a document the
 * company holds and can show. The card also makes the issuer the first thing
 * read, which is the right order: who says so matters before what they say.
 *
 * WHAT IT DELIBERATELY DOES NOT SHOW
 *
 * Attribute values. A card is recognition, not disclosure; the values sit
 * beside it on screens that need them, so a glance at a wall of cards never
 * displays the company's details to whoever is looking over a shoulder.
 *
 * Status still goes through StatusPill, because an expired or revoked card
 * that only looked faded would be status told by colour alone.
 */
const TINT: Record<CardTint, [string, string]> = {
  mint: ["var(--cred-mint-from)", "var(--cred-mint-to)"],
  sand: ["var(--cred-sand-from)", "var(--cred-sand-to)"],
  rose: ["var(--cred-rose-from)", "var(--cred-rose-to)"],
  sky: ["var(--cred-sky-from)", "var(--cred-sky-to)"],
  lilac: ["var(--cred-lilac-from)", "var(--cred-lilac-to)"],
  slate: ["var(--cred-slate-from)", "var(--cred-slate-to)"],
};

export function CredentialCard({
  type,
  issuer,
  status,
  foundational = false,
  formats = ["W3C VC"],
  selected,
  size = "md",
  footer,
}: {
  type: string;
  issuer: string;
  status?: "active" | "expired" | "revoked" | "offered";
  foundational?: boolean;
  formats?: string[];
  /** Present to draw the selection box (a card being chosen for a proof). */
  selected?: boolean;
  size?: "md" | "lg";
  footer?: ReactNode;
}) {
  /* One pattern per card: several cards share a page, and duplicate SVG ids
     are invalid even when the patterns are identical. */
  const patternId = `cred-guilloche-${useId().replace(/:/g, "")}`;
  const look = issuerLook(issuer);
  const [from, to] = TINT[look.tint];
  const settledBad = status === "expired" || status === "revoked";

  return (
    <article
      aria-label={`${type}, issued by ${issuer}`}
      className={`relative isolate flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-[18px] border p-4 ${
        size === "lg" ? "max-w-[420px] min-[641px]:p-5" : "max-w-[360px]"
      }`}
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: "var(--cred-ink)",
        borderColor: selected ? "var(--ndi-danger)" : "var(--cred-edge)",
        boxShadow: selected ? "0 0 0 1.5px var(--ndi-danger)" : "var(--shadow-card)",
        opacity: settledBad ? 0.78 : 1,
      }}
    >
      {/* The security-print texture, and the issuer's seal as a watermark —
          the two things that make a card read as issued rather than drawn. */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.07]">
        <defs>
          <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <path d="M0 7 Q3.5 0 7 7 T14 7" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <span aria-hidden="true" className="pointer-events-none absolute -right-[6%] top-1/2 -z-10 w-[46%] -translate-y-1/2 opacity-[0.12]">
        <IssuerSeal short={look.short} />
      </span>

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="m-0 flex items-center gap-2 text-[11.5px] font-medium" style={{ color: "var(--cred-ink-muted)" }}>
            <span className="h-6 w-6 flex-none">
              <IssuerSeal short={look.short} />
            </span>
            <span className="truncate">{issuer}</span>
          </p>
          <p
            className={`m-0 font-display font-semibold uppercase leading-[1.2] tracking-[0.02em] ${size === "lg" ? "text-[17px]" : "text-[15px]"}`}
          >
            {type}
          </p>
        </div>
        {foundational ? (
          <span
            className="inline-flex flex-none items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
            style={{ background: "var(--cred-chip)" }}
          >
            <Icon name="shieldCheck" size={11} strokeWidth={2.2} />
            Root of trust
          </span>
        ) : null}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {formats.map((f) => (
            <span key={f} className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--cred-chip)" }}>
              {f}
            </span>
          ))}
          {status && status !== "active" ? <StatusPill status={status} /> : null}
          {footer}
        </div>
        {selected !== undefined ? (
          <span
            aria-hidden="true"
            className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px] border"
            style={{
              borderColor: selected ? "var(--ndi-danger)" : "var(--cred-ink-muted)",
              background: selected ? "var(--ndi-danger)" : "var(--cred-chip)",
              color: "var(--ndi-000)",
            }}
          >
            {selected ? <Icon name="check" size={13} strokeWidth={3} /> : null}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/** A round seal with the issuer's initials — stands in for its registry logo. */
export function IssuerSeal({ short }: { short: string }) {
  const fontSize = short.length > 3 ? 19 : 23;
  return (
    <svg viewBox="0 0 64 64" className="block h-full w-full" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2.6" />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={700}
        fill="currentColor"
        style={{ fontFamily: "var(--font-display, inherit)", letterSpacing: "-0.02em" }}
      >
        {short}
      </text>
    </svg>
  );
}
