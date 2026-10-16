"use client";

import { useState, type ReactNode } from "react";

import { ResponsibilityGate } from "@/features/appointment/ResponsibilityGate";

import { Sidebar } from "./Sidebar";
import { SiteFooter } from "./SiteFooter";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: ReactNode;
}

/**
 * The signed-in chrome: a fixed top bar, a sidebar that becomes a drawer below
 * 901px (the website's tablet→desktop breakpoint), and the scrolling content
 * column beside it.
 */
export function AppShell({ children }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    /* The attribute is read by the `ndi-demo-harness` rule: the harness is
       fixed to the viewport and needs to know whether a sidebar is in the
       way. */
    <div data-app-shell="1">
      <TopBar navOpen={navOpen} onToggleNav={() => setNavOpen((o) => !o)} />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* The sidebar is fixed, so the content column is inset rather than
          laid out beside it.

          The cap is 1600 rather than the website's 1200: the sidebar already
          takes 248px off the viewport, so a 1200 column stranded ~470px of
          empty gutter on a 1920 display. 1600 fills a common desktop while
          still stopping table rows and banner copy from running to arm's
          length on an ultrawide. */}
      {/* A flex column at least as tall as the viewport, with the main region
          growing: that is what holds the footer to the bottom on a short page
          instead of letting it ride up under the content. box-sizing is
          border-box, so pt-16 comes out of the dvh rather than adding to it.

          The demo harness is fixed to the bottom of the viewport, so without
          the bottom padding the last thing on a page — usually the primary
          action — sat underneath it. It goes on this column rather than on
          <main> so the footer clears the harness as well. */}
      <div className="flex min-h-dvh flex-col pb-16 pt-16 min-[901px]:pl-[248px]">
        {/* A named container, so a page's two-column layouts key off the
            width the page actually has rather than the window's. With the
            guided demo's side panel open, a 1366px window gives the page
            about 650px; layouts keyed to the viewport still split it in two
            and squeezed a form into a 180px column. */}
        <main className="@container/page mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 min-[641px]:px-6 min-[901px]:px-8 min-[901px]:py-8">
          <ResponsibilityGate>{children}</ResponsibilityGate>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
