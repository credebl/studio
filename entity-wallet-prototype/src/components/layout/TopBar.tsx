"use client";

import { Icon } from "@/components/ui/icons";

import { AccountMenu } from "./AccountMenu";
import { Lockup } from "./Lockup";
import { OrgSwitcher } from "./OrgSwitcher";
import { ThemeToggle } from "./ThemeToggle";

interface TopBarProps {
  onToggleNav: () => void;
  navOpen: boolean;
}

export function TopBar({ onToggleNav, navOpen }: TopBarProps) {
  return (
    <header data-topbar="1" className="fixed inset-x-0 top-0 z-[60] h-16 bg-[var(--chrome-fill)] backdrop-blur-[20px] backdrop-saturate-[140%]">
      {/* The hairlines are drawn rather than set as a border-b, so the rule
          under the bar starts where the sidebar ends. A rule running the whole
          width cut the logo off from the nav column beneath it and made the
          two read as separate slabs; stopping it at 248px, and carrying the
          sidebar's right edge up to the top of the screen, leaves the brand
          block and the nav as one continuous surface. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[var(--border-subtle)] min-[901px]:left-[248px]" />
      <div className="pointer-events-none absolute inset-y-0 left-[247px] hidden w-px bg-[var(--border-subtle)] min-[901px]:block" />

      <div className="flex h-full items-center gap-3 px-4 min-[641px]:px-6">
        <button
          type="button"
          onClick={onToggleNav}
          aria-label={navOpen ? "Close menu" : "Open menu"}
          aria-expanded={navOpen}
          className="ndi-navrow inline-flex h-10 w-10 flex-none items-center justify-center rounded-[10px] min-[901px]:hidden"
          data-active="0"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d={navOpen ? "M18 6 6 18 M6 6l12 12" : "M4 6h16 M4 12h16 M4 18h16"} />
          </svg>
        </button>

        {/* Below 641px the mark stands in for the lockup: even at the new
            3.6:1 the full one leaves the row about a pixel short of the org
            selector and the icon buttons beside it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/media/logos/ndi-mark-mint.png"
          alt="NDI Studio"
          width={2496}
          height={2436}
          className="block h-8 w-auto flex-none min-[641px]:hidden"
        />
        <Lockup className="hidden h-8 w-auto flex-none min-[641px]:block" />

        <div className="ml-auto flex items-center gap-2">
          <OrgSwitcher />

          <button
            type="button"
            aria-label="Notifications"
            className="ndi-navrow inline-flex h-10 w-10 items-center justify-center rounded-[10px]"
            data-active="0"
          >
            <Icon name="bell" size={17} strokeWidth={1.7} />
          </button>

          <ThemeToggle />

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
