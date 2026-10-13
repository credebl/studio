"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/icons";
import { isPlatformAdmin } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * Which organisation the workspace is showing, and its settings.
 *
 * Closes on outside click and on Escape: it is a menu over the whole app, and
 * one that only closes by clicking its own trigger is a menu people end up
 * stuck under.
 */
export function OrgSwitcher() {
  const { organizations, activeOrgId, harness, currentPerson } = useDemo();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const isAdmin = isPlatformAdmin(currentPerson);

  /* Only the organisations this person belongs to — Yeshey never sees
     Pelden, Dorji never sees the bank. */
  const mine = organizations.filter((o) => o.memberIds.includes(harness.persona));
  const active = mine.find((o) => o.id === activeOrgId) ?? mine[0] ?? organizations.find((o) => o.id === activeOrgId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* NDI's administrators act for Bhutan NDI's own organisation and nothing
     else, so there is nothing to switch to. The organisation being acted in
     is still named — "never implied by context alone" (UX-EW-01 §3.4) — it
     just is not a menu. The shield marks it as the platform's own. */
  if (isAdmin) {
    return (
      <span className="inline-flex h-10 max-w-[260px] items-center gap-2.5 rounded-[10px] border border-grid bg-[rgb(var(--tint)/0.03)] px-3.5 font-display text-[13px] font-medium text-body">
        <Icon name="shieldCheck" size={15} strokeWidth={1.7} className="flex-none text-accent" />
        <span className="hidden truncate min-[561px]:inline">{active?.name ?? "Bhutan NDI"}</span>
      </span>
    );
  }

  return (
    <div className="relative" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="ndi-hairline-btn inline-flex h-10 max-w-[260px] items-center gap-2.5 rounded-[10px] border border-grid bg-[rgb(var(--tint)/0.03)] px-3.5 font-display text-[13px] font-medium text-body"
      >
        <Icon name="building" size={15} strokeWidth={1.7} className="flex-none text-accent" />
        <span className="hidden truncate min-[561px]:inline">
          {active ? active.name : "No organisation"}
        </span>
        <Icon
          name="chevronDown"
          size={13}
          strokeWidth={2}
          className="flex-none opacity-60 transition-transform duration-200 ease-ndi"
          style={{ transform: `rotate(${open ? 180 : 0}deg)` }}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Organisation"
          className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[268px] rounded-xl border p-1.5"
          style={{
            borderColor: "var(--border-grid)",
            background: "var(--surface-menu)",
            boxShadow:
              "0 20px 48px rgb(var(--shade) / 0.45), inset 0 1px 0 rgb(var(--gloss) / 0.06)",
          }}
        >
          {/* One organisation, shown rather than offered. The Entity Wallet
              is one business's wallet; there is nothing to switch to and no
              "create another" — an organisation arrives through onboarding,
              confirmed by a register, not from a menu. */}
          {active ? (
            <div className="flex items-center gap-2.5 px-3 py-2.5 text-[13px]">
              <span
                className="inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-grid font-display text-[12px] font-semibold text-[var(--text-on-mint)]"
                style={{ background: "var(--grad-mint)" }}
              >
                {active.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body">{active.name}</span>
                <span className="block text-[11px] text-faint">{active.role}</span>
              </span>
            </div>
          ) : (
            <p className="px-3 py-3 text-[13px] leading-[1.5] text-muted">No organisation yet.</p>
          )}

          <div className="my-1.5 h-px bg-[var(--border-subtle)]" />

          {active ? (
            <Link
              href="/dashboard/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="ndi-navrow flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px]"
              data-active="0"
            >
              <Icon name="settings" size={15} strokeWidth={1.8} className="flex-none text-accent" />
              Organisation settings
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
