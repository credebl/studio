"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon, type IconName } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

const ITEMS: { label: string; href: string; icon: IconName }[] = [
  { label: "Profile", href: "/profile", icon: "user" },
];

/**
 * The signed-in person, and the handful of things that belong to them rather
 * than to the organization.
 *
 * These used to sit in the sidebar, which put "who am I" in the same list as
 * "what am I working on". The avatar is where people look for their own
 * account, and it is where sign-out has to live — a destructive action does
 * not belong in a navigation list you scan past a dozen times a day.
 *
 * Closes on outside click and on Escape, like the organization switcher: a
 * menu overlaying the whole app that only closes by clicking its own trigger
 * is one people get stuck under.
 */
export function AccountMenu() {
  const router = useRouter();
  const { currentPerson } = useDemo();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  /* Whoever the console is being driven as is the account signed in — the
     demo has no session of its own. It used to read the inherited Studio
     member list, which named someone outside the story and emptied to "?"
     on a freshly registered organisation. */
  const me = currentPerson;
  const initial = (me?.name ?? "?").trim().slice(0, 1).toUpperCase();

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

  return (
    <div className="relative" ref={wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account"
        className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-grid font-display text-[13px] font-semibold text-[var(--text-on-mint)]"
        style={{ background: "var(--grad-mint)" }}
      >
        {initial}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[268px] rounded-xl border p-1.5"
          style={{
            borderColor: "var(--border-grid)",
            background: "var(--surface-menu)",
            boxShadow:
              "0 20px 48px rgb(var(--shade) / 0.45), inset 0 1px 0 rgb(var(--gloss) / 0.06)",
          }}
        >
          <div className="px-3 pb-2.5 pt-2">
            <p className="m-0 truncate font-display text-[13.5px] font-semibold text-strong">
              {me?.name ?? "Signed in"}
            </p>
            <p className="m-0 mt-0.5 truncate text-[12.5px] text-muted">{me?.email ?? "—"}</p>
          </div>

          <div className="my-1 h-px bg-[var(--border-subtle)]" />

          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="ndi-navrow flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px]"
              data-active="0"
            >
              <Icon name={item.icon} size={15} strokeWidth={1.8} className="flex-none" />
              {item.label}
            </Link>
          ))}

          <div className="my-1 h-px bg-[var(--border-subtle)]" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              /* No session to end — the demo signs out by returning to the
                 signed-out flow, which is what the control means here. */
              router.push("/sign-in");
            }}
            className="ndi-navrow flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px]"
            data-active="0"
          >
            <Icon name="logOut" size={15} strokeWidth={1.8} className="flex-none" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
