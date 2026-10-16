"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icons";

/**
 * What acting for an organisation asks of a person, written as things to do
 * (UX-EW-01 UXD-25) — never as a section number, which is not a duty anyone
 * can act on. Shared by the representative's acceptance (SCR-DEL-01) and an
 * appointee's (SCR-DEL-03), because it is the same set of duties and should
 * read the same way both times.
 *
 * The legal source sits behind "Read the full terms", with the exact wording
 * that is recorded with the acceptance. That wording is GovTech Liaison's to
 * draft (EW-FLOW3-SD §10 item 5); the prototype's is a placeholder and says
 * so. The statute is cited in this comment only: Companies Act 2016,
 * ss.111 and 114.
 */
export function Responsibilities({ orgName }: { orgName: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Your responsibilities</h2>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {[
          `Keep ${orgName}'s information confidential.`,
          `Use it only for ${orgName}'s purposes — never your own.`,
          "Act only within what you can do.",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
            <Icon name="arrowRight" size={13} strokeWidth={2} className="mt-[5px] flex-none text-faint" />
            {t}
          </li>
        ))}
      </ul>
      <p className="m-0 text-[13px] leading-[1.6] text-muted">
        Everything you do for {orgName} is recorded against your name. NDI holds {orgName}&rsquo;s
        keys; you never will.
      </p>
    </div>
  );
}

export function FullTerms({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="ndi-plainlink inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-muted"
      >
        <Icon name="chevronDown" size={13} strokeWidth={2} className={open ? "rotate-180" : ""} />
        Read the full terms
      </button>
      {open ? (
        <div className="rounded-[12px] border border-grid px-4 py-3 text-[12.5px] leading-[1.6] text-muted" style={{ background: "rgb(var(--tint) / 0.04)" }}>
          <p className="m-0">
            By accepting, you agree to act for {orgName} on the platform within what you can do; to keep
            its information confidential and use it only for its purposes; and that every action you take
            is recorded against your name. NDI holds {orgName}&rsquo;s keys and you never will.
          </p>
          <p className="m-0 mt-2 text-faint">
            Version 0.1, prototype wording. The final text is being drafted with GovTech, and the exact
            version you accept is recorded with your acceptance.
          </p>
        </div>
      ) : null}
    </div>
  );
}
