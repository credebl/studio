import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/icons";

import { AuthHeader } from "./AuthHeader";
import { SiteFooter } from "./SiteFooter";

interface AuthShellProps {
  children: ReactNode;
  /** The left rail's headline; one emphasised phrase, per the design system. */
  title: ReactNode;
  lead: string;
  scene: ReactNode;
}

/**
 * Page shell: the header, a two-column body that collapses to one
 * below 901px (the website's tablet→desktop breakpoint), and the footer rule.
 * Max width and gutters follow the website's PageSection.
 */
export function AuthShell({ children, title, lead, scene }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <AuthHeader />

      {/* The header is attached rather than floating, so the body needs no
          clearance padding — only its own breathing room. */}
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 items-center px-5 py-14 min-[641px]:px-8 min-[901px]:py-14">
        {/* Top-aligned, with the rail held in place while a long card scrolls.
            Centred, a tall card — an invitation's summary above its set-up
            form — pushed the rail's headline down to the fold at laptop
            height, where the demo's floating controls sat on top of it. */}
        <div className="grid w-full items-center gap-12 min-[901px]:grid-cols-[1.05fr_1fr] min-[901px]:items-start min-[901px]:gap-20">
          {/* Left rail — hidden on phones, where the form is the whole job. */}
          <section className="hidden min-[901px]:sticky min-[901px]:top-10 min-[901px]:block">
            <div className="mb-8 max-w-[380px]">{scene}</div>
            <Eyebrow>— Bhutan NDI</Eyebrow>
            <h1 className="mt-4 max-w-[460px] font-display text-[clamp(30px,3.4vw,42px)] font-semibold leading-[1.08] tracking-[-0.03em] text-strong [text-wrap:balance]">
              {title}
            </h1>
            <p className="mt-5 max-w-[440px] text-[17px] leading-[1.62] text-muted [text-wrap:pretty]">
              {lead}
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Verified credentials", "End-to-end encrypted"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-grid bg-[var(--fill-sunk)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent"
                >
                  <Icon name="check" size={12} strokeWidth={2.4} />
                  {label}
                </span>
              ))}
            </div>
          </section>

          {/* Right — the form panel. */}
          <section className="w-full justify-self-center min-[901px]:justify-self-end">
            <div
              data-cta-form="1"
              className="relative mx-auto w-full max-w-[440px] rounded-[16px] border border-grid p-5 min-[561px]:p-7 min-[901px]:rounded-[20px] min-[901px]:p-8"
            >
              {children}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
